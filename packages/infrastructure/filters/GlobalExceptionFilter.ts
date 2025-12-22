import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  path: string;
  method: string;
  errors?: Record<string, unknown> | string[];
  stack?: string;
  cause?: unknown;
}

interface ExceptionInfo {
  status: number;
  message: string;
  errors?: Record<string, unknown> | string[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
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

    this.enrichWithDevDetails(problemDetails, exception);

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message} `,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(problemDetails);
  }

  private extractExceptionInfo(exception: unknown): ExceptionInfo {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: ExceptionInfo['errors'];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(resp.errors)) {
          message = 'Validation failed';
          errors = resp.errors as string[];
        } else {
          message = (resp.message as string) ?? message;
          errors = resp.errors as Record<string, unknown>;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    } else if (typeof exception === 'object' && exception !== null) {
      status = (exception as any).statusCode ?? status;
      message = (exception as any).message ?? message;
      errors = (exception as any).errors;
    }

    return { status, message, errors };
  }

  private enrichWithDevDetails(problemDetails: ProblemDetails, exception: unknown): void {
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      problemDetails.stack = exception.stack;
      problemDetails.title = exception.name;
      problemDetails.errors = {
        message: exception.message,
        name: exception.name,
        ...(problemDetails.errors && { validation: problemDetails.errors }),
      };
      if ((exception as any).cause) {
        problemDetails.cause = (exception as any).cause;
      }
    }
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
      422: 'Validation Failed',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return titles[status] ?? 'Error';
  }
}