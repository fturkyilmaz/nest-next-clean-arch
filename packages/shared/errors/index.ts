/**
 * Standardized Error Codes Dictionary
 * Single source of truth for all error codes used across API, web, and mobile apps
 * Used for i18n, error tracking, and consistent error handling
 */

/**
 * Enumeration of all standardized error codes
 */
export enum ErrorCode {
    // Authentication & Authorization (AUTH_xxx)
    UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
    FORBIDDEN = 'AUTH_FORBIDDEN',
    INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
    TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
    SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
    TWO_FACTOR_REQUIRED = 'AUTH_2FA_REQUIRED',
    TWO_FACTOR_INVALID = 'AUTH_2FA_INVALID',

    // Validation Errors (VALIDATION_xxx)
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_EMAIL = 'VALIDATION_INVALID_EMAIL',
    PASSWORD_TOO_WEAK = 'VALIDATION_PASSWORD_WEAK',
    INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
    MISSING_REQUIRED_FIELD = 'VALIDATION_MISSING_FIELD',
    INVALID_ENUM = 'VALIDATION_INVALID_ENUM',

    // Resource Not Found (NOT_FOUND_xxx)
    NOT_FOUND = 'NOT_FOUND',
    USER_NOT_FOUND = 'NOT_FOUND_USER',
    CLIENT_NOT_FOUND = 'NOT_FOUND_CLIENT',
    DIET_PLAN_NOT_FOUND = 'NOT_FOUND_DIET_PLAN',
    MEAL_NOT_FOUND = 'NOT_FOUND_MEAL',
    FOOD_NOT_FOUND = 'NOT_FOUND_FOOD',
    APPOINTMENT_NOT_FOUND = 'NOT_FOUND_APPOINTMENT',
    METRICS_NOT_FOUND = 'NOT_FOUND_METRICS',

    // Conflict Errors (CONFLICT_xxx)
    CONFLICT = 'CONFLICT',
    DUPLICATE_EMAIL = 'CONFLICT_DUPLICATE_EMAIL',
    DUPLICATE_ENTRY = 'CONFLICT_DUPLICATE_ENTRY',
    RESOURCE_ALREADY_EXISTS = 'CONFLICT_RESOURCE_EXISTS',
    OPTIMISTIC_LOCK_FAILED = 'CONFLICT_OPTIMISTIC_LOCK',

    // Business Logic Errors (BUSINESS_xxx)
    INVALID_STATE_TRANSITION = 'BUSINESS_INVALID_STATE_TRANSITION',
    INSUFFICIENT_PERMISSIONS = 'BUSINESS_INSUFFICIENT_PERMISSIONS',
    BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
    CANNOT_DELETE_ACTIVE_PLAN = 'BUSINESS_CANNOT_DELETE_ACTIVE',
    INVALID_DATE_RANGE = 'BUSINESS_INVALID_DATE_RANGE',
    OVERLAPPING_APPOINTMENT = 'BUSINESS_OVERLAPPING_APPOINTMENT',

    // Rate Limiting & Quota (RATE_xxx)
    RATE_LIMITED = 'RATE_LIMITED',
    QUOTA_EXCEEDED = 'RATE_QUOTA_EXCEEDED',
    TOO_MANY_REQUESTS = 'RATE_TOO_MANY_REQUESTS',
    TOO_MANY_LOGIN_ATTEMPTS = 'RATE_TOO_MANY_ATTEMPTS',

    // Server Errors (SERVER_xxx)
    INTERNAL_SERVER_ERROR = 'SERVER_INTERNAL_ERROR',
    SERVICE_UNAVAILABLE = 'SERVER_UNAVAILABLE',
    BAD_GATEWAY = 'SERVER_BAD_GATEWAY',
    GATEWAY_TIMEOUT = 'SERVER_GATEWAY_TIMEOUT',
    UNIMPLEMENTED = 'SERVER_UNIMPLEMENTED',

    // Network & Client Errors (NETWORK_xxx)
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT = 'NETWORK_TIMEOUT',
    CONNECTION_REFUSED = 'NETWORK_CONNECTION_REFUSED',
    CONNECTION_LOST = 'NETWORK_CONNECTION_LOST',
    OFFLINE = 'NETWORK_OFFLINE',

    // File & Upload Errors (FILE_xxx)
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE = 'FILE_INVALID_TYPE',
    UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',

    // Data & Processing Errors (DATA_xxx)
    DATA_PARSE_ERROR = 'DATA_PARSE_ERROR',
    DATA_INTEGRITY_ERROR = 'DATA_INTEGRITY_ERROR',
    INVALID_DATA_FORMAT = 'DATA_INVALID_FORMAT',
    DATABASE_ERROR = 'DATA_DATABASE_ERROR',

    // Unknown Error
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error Messages Dictionary
 * Provides human-readable messages for each error code
 * Can be used as fallback or for i18n key mapping
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    // Authentication & Authorization
    [ErrorCode.UNAUTHORIZED]: 'You are not authorized to access this resource',
    [ErrorCode.FORBIDDEN]: 'You do not have permission to access this resource',
    [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
    [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please log in again',
    [ErrorCode.TOKEN_INVALID]: 'Invalid or corrupted authentication token',
    [ErrorCode.SESSION_EXPIRED]: 'Your session has expired',
    [ErrorCode.TWO_FACTOR_REQUIRED]: 'Two-factor authentication is required',
    [ErrorCode.TWO_FACTOR_INVALID]: 'Invalid two-factor authentication code',

    // Validation
    [ErrorCode.VALIDATION_ERROR]: 'Please check the form for errors',
    [ErrorCode.INVALID_EMAIL]: 'Please enter a valid email address',
    [ErrorCode.PASSWORD_TOO_WEAK]: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
    [ErrorCode.INVALID_FORMAT]: 'Invalid format provided',
    [ErrorCode.MISSING_REQUIRED_FIELD]: 'This field is required',
    [ErrorCode.INVALID_ENUM]: 'Invalid value selected',

    // Not Found
    [ErrorCode.NOT_FOUND]: 'Resource not found',
    [ErrorCode.USER_NOT_FOUND]: 'User not found',
    [ErrorCode.CLIENT_NOT_FOUND]: 'Client not found',
    [ErrorCode.DIET_PLAN_NOT_FOUND]: 'Diet plan not found',
    [ErrorCode.MEAL_NOT_FOUND]: 'Meal not found',
    [ErrorCode.FOOD_NOT_FOUND]: 'Food item not found',
    [ErrorCode.APPOINTMENT_NOT_FOUND]: 'Appointment not found',
    [ErrorCode.METRICS_NOT_FOUND]: 'Metrics not found',

    // Conflict
    [ErrorCode.CONFLICT]: 'Resource conflict',
    [ErrorCode.DUPLICATE_EMAIL]: 'This email is already registered',
    [ErrorCode.DUPLICATE_ENTRY]: 'This entry already exists',
    [ErrorCode.RESOURCE_ALREADY_EXISTS]: 'This resource already exists',
    [ErrorCode.OPTIMISTIC_LOCK_FAILED]: 'Resource was modified by another user. Please refresh and try again',

    // Business Logic
    [ErrorCode.INVALID_STATE_TRANSITION]: 'This action cannot be performed in the current state',
    [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action',
    [ErrorCode.BUSINESS_RULE_VIOLATION]: 'This action violates a business rule',
    [ErrorCode.CANNOT_DELETE_ACTIVE_PLAN]: 'Cannot delete an active diet plan',
    [ErrorCode.INVALID_DATE_RANGE]: 'Invalid date range selected',
    [ErrorCode.OVERLAPPING_APPOINTMENT]: 'This appointment overlaps with an existing one',

    // Rate Limiting
    [ErrorCode.RATE_LIMITED]: 'Too many requests. Please try again later',
    [ErrorCode.QUOTA_EXCEEDED]: 'Quota exceeded',
    [ErrorCode.TOO_MANY_REQUESTS]: 'Too many requests. Please wait before trying again',
    [ErrorCode.TOO_MANY_LOGIN_ATTEMPTS]: 'Too many failed login attempts. Please try again later',

    // Server Errors
    [ErrorCode.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred. Please try again',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later',
    [ErrorCode.BAD_GATEWAY]: 'Service is temporarily unavailable',
    [ErrorCode.GATEWAY_TIMEOUT]: 'Request timeout. Please try again',
    [ErrorCode.UNIMPLEMENTED]: 'This feature is not yet implemented',

    // Network
    [ErrorCode.NETWORK_ERROR]: 'Network connection error. Please check your internet connection',
    [ErrorCode.TIMEOUT]: 'Request timeout. Please check your connection and try again',
    [ErrorCode.CONNECTION_REFUSED]: 'Connection refused. Please check your internet connection',
    [ErrorCode.CONNECTION_LOST]: 'Connection lost. Please check your internet connection',
    [ErrorCode.OFFLINE]: 'You are offline. Please check your internet connection',

    // File
    [ErrorCode.FILE_NOT_FOUND]: 'File not found',
    [ErrorCode.FILE_TOO_LARGE]: 'File is too large. Maximum size is 10MB',
    [ErrorCode.INVALID_FILE_TYPE]: 'Invalid file type. Please upload a valid file',
    [ErrorCode.UPLOAD_FAILED]: 'File upload failed. Please try again',

    // Data
    [ErrorCode.DATA_PARSE_ERROR]: 'Unable to process the response data',
    [ErrorCode.DATA_INTEGRITY_ERROR]: 'Data integrity error',
    [ErrorCode.INVALID_DATA_FORMAT]: 'Invalid data format',
    [ErrorCode.DATABASE_ERROR]: 'Database error occurred',

    // Unknown
    [ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred',
};

/**
 * Get i18n key for error code
 * Useful for translation systems
 */
export function getErrorI18nKey(code: ErrorCode): string {
    return `error.${code.toLowerCase()}`;
}

/**
 * Get error message for error code
 * Falls back to UNKNOWN_ERROR if code not found
 */
export function getErrorMessage(code: ErrorCode | string): string {
    return ERROR_MESSAGES[code as ErrorCode] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Check if error code is a client error (4xx)
 */
export function isClientError(code: ErrorCode): boolean {
    return (
        code.startsWith('AUTH_') ||
        code.startsWith('VALIDATION_') ||
        code.startsWith('NOT_FOUND_') ||
        code.startsWith('CONFLICT_') ||
        code.startsWith('RATE_') ||
        code === ErrorCode.NOT_FOUND ||
        code === ErrorCode.CONFLICT ||
        code === ErrorCode.VALIDATION_ERROR
    );
}

/**
 * Check if error code is a server error (5xx)
 */
export function isServerError(code: ErrorCode): boolean {
    return code.startsWith('SERVER_') || code.startsWith('DATA_');
}

/**
 * Check if error code is a network error
 */
export function isNetworkError(code: ErrorCode): boolean {
    return code.startsWith('NETWORK_');
}

/**
 * Map HTTP status code to ErrorCode
 */
export function mapHttpStatusToErrorCode(status: number): ErrorCode {
    const statusMap: Record<number, ErrorCode> = {
        400: ErrorCode.VALIDATION_ERROR,
        401: ErrorCode.UNAUTHORIZED,
        403: ErrorCode.FORBIDDEN,
        404: ErrorCode.NOT_FOUND,
        409: ErrorCode.CONFLICT,
        422: ErrorCode.VALIDATION_ERROR,
        429: ErrorCode.RATE_LIMITED,
        500: ErrorCode.INTERNAL_SERVER_ERROR,
        502: ErrorCode.BAD_GATEWAY,
        503: ErrorCode.SERVICE_UNAVAILABLE,
        504: ErrorCode.GATEWAY_TIMEOUT,
    };
    return statusMap[status] || ErrorCode.UNKNOWN_ERROR;
}

/**
 * Map ErrorCode to HTTP status code
 */
export function mapErrorCodeToHttpStatus(code: ErrorCode): number {
    if (code.startsWith('AUTH_')) return code === ErrorCode.FORBIDDEN ? 403 : 401;
    if (code.startsWith('NOT_FOUND_') || code === ErrorCode.NOT_FOUND) return 404;
    if (code.startsWith('CONFLICT_') || code === ErrorCode.CONFLICT) return 409;
    if (code.startsWith('VALIDATION_') || code === ErrorCode.VALIDATION_ERROR) return 422;
    if (code.startsWith('RATE_')) return 429;
    if (code.startsWith('SERVER_')) return 500;
    if (code.startsWith('BUSINESS_')) return 422;
    if (code.startsWith('DATA_')) return 500;
    if (code.startsWith('NETWORK_')) return 0;
    return 500;
}
