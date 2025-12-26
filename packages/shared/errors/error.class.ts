import { ErrorCode, ERROR_MESSAGES, mapErrorCodeToHttpStatus } from './index';

/**
 * Standardized Error Response Format
 * Used consistently across API, web, and mobile apps
 */
export interface ErrorResponse {
    code: ErrorCode;
    message: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    details?: Record<string, string | string[]>;
    traceId?: string;
    context?: Record<string, unknown>;
}

/**
 * Application Error Class
 * Extends Error with additional fields for structured error handling
 */
export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly details?: Record<string, string | string[]>;
    public readonly context?: Record<string, unknown>;
    public readonly timestamp: string;
    public readonly traceId?: string;

    constructor(
        code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
        message?: string,
        statusCode?: number,
        details?: Record<string, string | string[]>,
        context?: Record<string, unknown>,
        traceId?: string,
    ) {
        super(message || ERROR_MESSAGES[code]);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode || mapErrorCodeToHttpStatus(code);
        this.details = details;
        this.context = context;
        this.timestamp = new Date().toISOString();
        this.traceId = traceId;

        // Maintain proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, AppError.prototype);
    }

    /**
     * Convert to error response format
     */
    toResponse(path?: string): ErrorResponse {
        return {
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            path,
            details: this.details,
            traceId: this.traceId,
            context: this.context,
        };
    }

    /**
     * Convert to JSON for logging
     */
    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            details: this.details,
            context: this.context,
            traceId: this.traceId,
            stack: this.stack,
        };
    }
}

/**
 * Validation Error - extends AppError
 * Used for form validation and schema validation failures
 */
export class ValidationError extends AppError {
    constructor(
        details: Record<string, string | string[]>,
        message = 'Please check the form for errors',
        context?: Record<string, unknown>,
        traceId?: string,
    ) {
        super(
            ErrorCode.VALIDATION_ERROR,
            message,
            422,
            details,
            context,
            traceId,
        );
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Not Found Error
 * Used when a resource cannot be found
 */
export class NotFoundError extends AppError {
    constructor(
        resourceType: string,
        code: ErrorCode = ErrorCode.NOT_FOUND,
        context?: Record<string, unknown>,
        traceId?: string,
    ) {
        const message = `${resourceType} not found`;
        super(code, message, 404, undefined, context, traceId);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Conflict Error
 * Used when there's a resource conflict
 */
export class ConflictError extends AppError {
    constructor(
        message: string,
        code: ErrorCode = ErrorCode.CONFLICT,
        details?: Record<string, string | string[]>,
        context?: Record<string, unknown>,
        traceId?: string,
    ) {
        super(code, message, 409, details, context, traceId);
        this.name = 'ConflictError';
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

/**
 * Authentication Error
 * Used for auth-related failures
 */
export class AuthenticationError extends AppError {
    constructor(
        code: ErrorCode = ErrorCode.UNAUTHORIZED,
        message?: string,
        context?: Record<string, unknown>,
        traceId?: string,
    ) {
        super(code, message, 401, undefined, context, traceId);
        this.name = 'AuthenticationError';
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * Authorization Error
 * Used when user doesn't have permission
 */
export class AuthorizationError extends AppError {
    constructor(
        message = 'You do not have permission to access this resource',
        code: ErrorCode = ErrorCode.FORBIDDEN,
        context?: Record<string, unknown>,
        traceId?: string,
    ) {
        super(code, message, 403, undefined, context, traceId);
        this.name = 'AuthorizationError';
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

/**
 * Business Logic Error
 * Used when business rules are violated
 */
export class BusinessLogicError extends AppError {
    constructor(
        message: string,
        code: ErrorCode = ErrorCode.BUSINESS_RULE_VIOLATION,
        context?: Record<string, unknown>,
        traceId?: string,
    ) {
        super(code, message, 422, undefined, context, traceId);
        this.name = 'BusinessLogicError';
        Object.setPrototypeOf(this, BusinessLogicError.prototype);
    }
}

/**
 * Rate Limit Error
 * Used when rate limiting is triggered
 */
export class RateLimitError extends AppError {
    public readonly retryAfter?: number;

    constructor(
        message = 'Too many requests. Please try again later',
        retryAfter?: number,
        context?: Record<string, unknown>,
        traceId?: string,
    ) {
        super(
            ErrorCode.RATE_LIMITED,
            message,
            429,
            undefined,
            context,
            traceId,
        );
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * Network Error
 * Used for network-related failures
 */
export class NetworkError extends AppError {
    constructor(
        code: ErrorCode = ErrorCode.NETWORK_ERROR,
        message?: string,
        context?: Record<string, unknown>,
        traceId?: string,
    ) {
        super(code, message, 0, undefined, context, traceId);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}

/**
 * Timeout Error
 * Used for request timeouts
 */
export class TimeoutError extends AppError {
    constructor(
        message = 'Request timeout. Please check your connection and try again',
        context?: Record<string, unknown>,
        traceId?: string,
    ) {
        super(
            ErrorCode.TIMEOUT,
            message,
            0,
            undefined,
            context,
            traceId,
        );
        this.name = 'TimeoutError';
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * Type guard to check if error is a network error
 */
export function isNetworkErrorInstance(error: unknown): boolean {
    return (
        error instanceof NetworkError ||
        error instanceof TimeoutError ||
        (error instanceof AppError && error.code.startsWith('NETWORK_'))
    );
}

/**
 * Type guard to check if error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
}

/**
 * Convert any error to AppError
 */
export function toAppError(
    error: unknown,
    fallbackCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    context?: Record<string, unknown>,
): AppError {
    if (error instanceof AppError) {
        return error;
    }

    if (error instanceof Error) {
        const message = error.message || ERROR_MESSAGES[fallbackCode];
        return new AppError(fallbackCode, message, undefined, undefined, {
            originalError: error.name,
            ...context,
        });
    }

    if (typeof error === 'string') {
        return new AppError(fallbackCode, error, undefined, undefined, context);
    }

    if (typeof error === 'object' && error !== null) {
        return new AppError(
            fallbackCode,
            ERROR_MESSAGES[fallbackCode],
            undefined,
            undefined,
            { ...error, ...context },
        );
    }

    return new AppError(fallbackCode, ERROR_MESSAGES[fallbackCode], undefined, undefined, context);
}
