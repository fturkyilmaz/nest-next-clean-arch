import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    ConflictException,
    TooManyRequestsException,
    InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
    AppError,
    ErrorResponse,
    ValidationError,
    NotFoundError,
    ConflictError,
    AuthenticationError,
    AuthorizationError,
    RateLimitError,
    BusinessLogicError,
} from '@diet/shared/errors';
import { ErrorCode, ERROR_MESSAGES, mapErrorCodeToHttpStatus } from '@diet/shared/errors';

/**
 * Global Exception Filter for NestJS
 * Catches all exceptions and converts them to standardized error responses
 * Handles:
 * - AppError instances from application layer
 * - NestJS HTTP exceptions
 * - Validation errors (Zod, class-validator)
 * - Unknown/generic errors
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const traceId = request.headers['x-trace-id'] as string | undefined;

        let appError: AppError;
        let statusCode: number;

        // Convert exception to AppError
        if (exception instanceof AppError) {
            appError = exception;
            statusCode = exception.statusCode;
        } else if (exception instanceof HttpException) {
            appError = this.handleHttpException(exception, traceId);
            statusCode = exception.getStatus();
        } else if (exception instanceof ZodError) {
            appError = this.handleZodError(exception, traceId);
            statusCode = 422;
        } else if (exception instanceof Error) {
            appError = this.handleError(exception, traceId);
            statusCode = 500;
        } else {
            appError = new AppError(
                ErrorCode.UNKNOWN_ERROR,
                ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
                500,
                undefined,
                { originalError: String(exception) },
                traceId,
            );
            statusCode = 500;
        }

        // Log error
        this.logError(appError, request);

        // Build error response
        const errorResponse = this.buildErrorResponse(
            appError,
            request,
            statusCode,
        );

        // Send response
        response.status(statusCode).json(errorResponse);
    }

    /**
     * Handle NestJS HttpException
     */
    private handleHttpException(
        exception: HttpException,
        traceId?: string,
    ): AppError {
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        // Handle NestJS BadRequestException with validation errors
        if (
            exception instanceof BadRequestException &&
            typeof exceptionResponse === 'object'
        ) {
            const response = exceptionResponse as any;
            if (response.message && Array.isArray(response.message)) {
                // class-validator format
                const details: Record<string, string | string[]> = {};
                for (const msg of response.message) {
                    if (typeof msg === 'string') {
                        details['form'] = msg;
                    }
                }
                return new ValidationError(details, 'Please check the form for errors', undefined, traceId);
            }
        }

        // Map NestJS exceptions to AppError
        const errorCodeMap: Record<number, ErrorCode> = {
            [HttpStatus.BAD_REQUEST]: ErrorCode.VALIDATION_ERROR,
            [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
            [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
            [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
            [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
            [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.VALIDATION_ERROR,
            [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.RATE_LIMITED,
            [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.INTERNAL_SERVER_ERROR,
            [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.SERVICE_UNAVAILABLE,
        };

        const code = errorCodeMap[status] || ErrorCode.UNKNOWN_ERROR;
        const message =
            typeof exceptionResponse === 'object' &&
            exceptionResponse !== null &&
            'message' in exceptionResponse
                ? (exceptionResponse as any).message
                : exception.message;

        return new AppError(
            code,
            message || ERROR_MESSAGES[code],
            status,
            undefined,
            undefined,
            traceId,
        );
    }

    /**
     * Handle Zod validation errors
     */
    private handleZodError(error: ZodError, traceId?: string): AppError {
        const details: Record<string, string | string[]> = {};

        for (const issue of error.issues) {
            const path = issue.path.join('.');
            const message = issue.message;

            if (details[path]) {
                if (Array.isArray(details[path])) {
                    (details[path] as string[]).push(message);
                } else {
                    details[path] = [details[path] as string, message];
                }
            } else {
                details[path] = message;
            }
        }

        return new ValidationError(details, 'Validation failed', undefined, traceId);
    }

    /**
     * Handle generic Error objects
     */
    private handleError(error: Error, traceId?: string): AppError {
        // Check for specific error types
        if (error.name === 'ValidationError') {
            return new ValidationError(
                { form: error.message },
                error.message,
                undefined,
                traceId,
            );
        }

        if (error.name === 'NotFoundError') {
            return new NotFoundError(
                'Resource',
                ErrorCode.NOT_FOUND,
                { originalError: error.message },
                traceId,
            );
        }

        if (error.name === 'ConflictError') {
            return new ConflictError(
                error.message,
                ErrorCode.CONFLICT,
                undefined,
                undefined,
                traceId,
            );
        }

        // Generic error
        return new AppError(
            ErrorCode.INTERNAL_SERVER_ERROR,
            process.env.NODE_ENV === 'production'
                ? ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR]
                : error.message,
            500,
            undefined,
            { originalError: error.name },
            traceId,
        );
    }

    /**
     * Build standardized error response
     */
    private buildErrorResponse(
        error: AppError,
        request: Request,
        statusCode: number,
    ): ErrorResponse {
        const response = error.toResponse(request.url);
        response.statusCode = statusCode;

        // Remove sensitive information in production
        if (process.env.NODE_ENV === 'production') {
            delete response.context;
        }

        return response;
    }

    /**
     * Log error with appropriate level
     */
    private logError(error: AppError, request: Request) {
        const logData = {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            path: request.url,
            method: request.method,
            traceId: error.traceId,
            details: error.details,
        };

        if (error.statusCode >= 500) {
            this.logger.error('Server error', { ...logData, stack: error.stack });
        } else if (error.statusCode >= 400 && error.statusCode < 500) {
            // Only log client errors at debug level, except validation and auth
            if (
                error.code === ErrorCode.VALIDATION_ERROR ||
                error.code === ErrorCode.UNAUTHORIZED ||
                error.code === ErrorCode.FORBIDDEN
            ) {
                this.logger.debug('Client error', logData);
            }
        }
    }
}

/**
 * Exception filter for async/promise rejections
 * Use this in main.ts to handle unhandled promise rejections
 */
export function setupGlobalExceptionHandling() {
    const logger = new Logger('UnhandledExceptionHandler');

    process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
        logger.error('Unhandled Rejection', {
            reason: reason instanceof Error ? reason.message : String(reason),
            stack: reason instanceof Error ? reason.stack : undefined,
            promise: String(promise),
        });
    });

    process.on('uncaughtException', (error: Error) => {
        logger.error('Uncaught Exception', {
            message: error.message,
            stack: error.stack,
        });
        // Exit process after logging
        process.exit(1);
    });
}
