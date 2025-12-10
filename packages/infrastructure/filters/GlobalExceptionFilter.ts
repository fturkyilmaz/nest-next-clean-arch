import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://tools.ietf.org/html/rfc7807
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  path: string;
  method: string;
  errors?: any;
  stack?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, errors } = this.extractExceptionInfo(exception);

    const problemDetails: ProblemDetails = {
      type: this.getErrorType(status),
      title: this.getErrorTitle(status),
      status,
      detail: message,
      instance: request.url,
      timestamp: new Date().toISOString(),
      path: request.path,
      method: request.method,
      errors,
    };

    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      problemDetails.stack = exception.stack;
      problemDetails.title = exception.name;
      problemDetails.errors = {
        message: exception.message,
        name: exception.name,
      };
    }

    // Log error (her ortamda)
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(problemDetails);
  }

  private extractExceptionInfo(exception: unknown): {
    status: number;
    message: string;
    errors?: any;
  } {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp: any = exceptionResponse;
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          errors = resp.message;
        } else {
          message = resp.message || message;
          errors = resp.errors;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    return { status, message, errors };
  }

  private getErrorType(status: number): string {
    return `https://httpstatuses.com/${status}`;
  }

  private getErrorTitle(status: number): string {
    const titles: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return titles[status] || 'Error';
  }
}
