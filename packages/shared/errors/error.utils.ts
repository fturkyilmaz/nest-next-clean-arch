import {
    AppError,
    ErrorResponse,
    isAppError,
    toAppError,
} from './error.class';
import { ErrorCode, mapHttpStatusToErrorCode } from './index';

/**
 * Error handling utilities for consistent error processing
 */

/**
 * Extract error details from validation error object
 */
export function extractValidationDetails(error: unknown): Record<string, string | string[]> {
    const details: Record<string, string | string[]> = {};

    if (error && typeof error === 'object') {
        if ('issues' in error) {
            // Zod validation error
            const issues = error.issues as Array<{ path: (string | number)[]; message: string }>;
            for (const issue of issues) {
                const path = issue.path.join('.');
                if (details[path]) {
                    if (Array.isArray(details[path])) {
                        (details[path] as string[]).push(issue.message);
                    } else {
                        details[path] = [details[path] as string, issue.message];
                    }
                } else {
                    details[path] = issue.message;
                }
            }
        } else if ('fieldErrors' in error) {
            // Alternative validation format
            return error.fieldErrors as Record<string, string | string[]>;
        }
    }

    return details;
}

/**
 * Format error for API response
 * Sanitizes sensitive information in production
 */
export function formatErrorResponse(
    error: Error | AppError,
    path?: string,
    traceId?: string,
    isProduction = false,
): ErrorResponse {
    if (isAppError(error)) {
        const response = error.toResponse(path);
        if (traceId) {
            response.traceId = traceId;
        }
        if (isProduction) {
            // Remove sensitive context in production
            delete response.context;
        }
        return response;
    }

    const appError = toAppError(error);
    const response = appError.toResponse(path);
    if (traceId) {
        response.traceId = traceId;
    }
    if (isProduction) {
        delete response.context;
    }
    return response;
}

/**
 * Handle Axios/fetch errors and convert to AppError
 */
export function handleHttpError(error: any, traceId?: string): AppError {
    // Network error
    if (!error.response) {
        if (error.code === 'ECONNABORTED') {
            return toAppError(error, ErrorCode.TIMEOUT, { traceId });
        }
        if (error.message === 'Network Error' || !navigator.onLine) {
            return toAppError(error, ErrorCode.NETWORK_ERROR, { traceId });
        }
        return toAppError(error, ErrorCode.NETWORK_ERROR, { traceId });
    }

    const status = error.response.status;
    const errorCode = mapHttpStatusToErrorCode(status);
    const data = error.response.data;

    // API returned structured error
    if (data && typeof data === 'object') {
        if ('code' in data && 'message' in data) {
            return new AppError(
                data.code as ErrorCode,
                data.message as string,
                status,
                data.details as Record<string, string | string[]>,
                undefined,
                traceId,
            );
        }
        if ('message' in data) {
            return new AppError(
                errorCode,
                data.message as string,
                status,
                undefined,
                data,
                traceId,
            );
        }
    }

    return new AppError(
        errorCode,
        error.message || 'An error occurred',
        status,
        undefined,
        { responseData: data },
        traceId,
    );
}

/**
 * Sanitize error message for frontend (remove stack traces, sensitive info)
 */
export function sanitizeErrorMessage(message: string): string {
    // Remove stack traces
    if (message.includes('at ')) {
        return message.split('at ')[0].trim();
    }
    // Remove URLs and IPs (basic)
    return message.replace(/https?:\/\/[^\s]+/g, '[URL]').replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[IP]');
}

/**
 * Create error context object for logging
 */
export function createErrorContext(
    error: Error | AppError,
    additionalContext?: Record<string, unknown>,
) {
    const context: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        errorName: error.name,
        errorMessage: error.message,
        ...additionalContext,
    };

    if (isAppError(error)) {
        context.errorCode = error.code;
        context.statusCode = error.statusCode;
        context.details = error.details;
        context.traceId = error.traceId;
        if (error.context) {
            context.appContext = error.context;
        }
    }

    if (error.stack) {
        context.stack = error.stack;
    }

    return context;
}

/**
 * Check if error should trigger user-facing notification
 */
export function shouldNotifyUser(error: AppError | Error): boolean {
    if (!isAppError(error)) {
        return true; // Notify for unknown errors
    }

    // Don't notify for certain internal errors
    const silentCodes: ErrorCode[] = [
        ErrorCode.UNKNOWN_ERROR,
        ErrorCode.SERVER_INTERNAL_ERROR,
    ];

    return !silentCodes.includes(error.code);
}

/**
 * Get user-facing error message
 * Can be enhanced for i18n
 */
export function getUserFacingMessage(error: Error | AppError): string {
    if (isAppError(error)) {
        return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
}

/**
 * Retry configuration for different error types
 */
export interface RetryConfig {
    shouldRetry: boolean;
    delayMs: number;
    maxRetries: number;
}

/**
 * Determine if error should be retried and retry config
 */
export function getRetryConfig(
    error: AppError | Error,
    attemptCount = 0,
): RetryConfig {
    if (!isAppError(error)) {
        // Retry non-app errors (likely network issues)
        return {
            shouldRetry: attemptCount < 3,
            delayMs: Math.min(1000 * Math.pow(2, attemptCount), 10000),
            maxRetries: 3,
        };
    }

    const code = error.code;
    const statusCode = error.statusCode;

    // Retry on network errors
    if (code.startsWith('NETWORK_') || code === ErrorCode.TIMEOUT) {
        return {
            shouldRetry: attemptCount < 3,
            delayMs: Math.min(1000 * Math.pow(2, attemptCount), 10000),
            maxRetries: 3,
        };
    }

    // Retry on rate limit with backoff
    if (code === ErrorCode.RATE_LIMITED) {
        const delayMs = error instanceof Error && error.hasOwnProperty('retryAfter')
            ? (error as any).retryAfter * 1000
            : Math.min(1000 * Math.pow(2, attemptCount), 60000);
        return {
            shouldRetry: attemptCount < 5,
            delayMs,
            maxRetries: 5,
        };
    }

    // Retry on 5xx errors
    if (statusCode >= 500 && statusCode < 600) {
        return {
            shouldRetry: attemptCount < 3,
            delayMs: Math.min(1000 * Math.pow(2, attemptCount), 10000),
            maxRetries: 3,
        };
    }

    // Retry on 408 (Request Timeout) or 429 (Too Many Requests)
    if (statusCode === 408 || statusCode === 429) {
        return {
            shouldRetry: attemptCount < 3,
            delayMs: Math.min(1000 * Math.pow(2, attemptCount), 10000),
            maxRetries: 3,
        };
    }

    // Don't retry client errors or auth errors
    return {
        shouldRetry: false,
        delayMs: 0,
        maxRetries: 0,
    };
}
