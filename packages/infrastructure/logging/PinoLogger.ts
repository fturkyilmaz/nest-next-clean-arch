import pino, { Logger, LoggerOptions } from 'pino';

/**
 * Create configured Pino logger instance
 * Structured JSON logging for production, pretty-print for development
 */
export function createLogger(context?: string): Logger {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    const options: LoggerOptions = {
        level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

        // Base fields included in every log
        base: {
            app: 'diet-management-api',
            version: process.env.npm_package_version || '1.0.0',
            env: process.env.NODE_ENV || 'development',
            ...(context && { context }),
        },

        // Timestamp format
        timestamp: pino.stdTimeFunctions.isoTime,

        // Redact sensitive fields
        redact: {
            paths: [
                'password',
                'token',
                'accessToken',
                'refreshToken',
                'authorization',
                'req.headers.authorization',
                'req.headers.cookie',
                '*.password',
                '*.token',
            ],
            censor: '[REDACTED]',
        },

        // Serializers for common objects
        serializers: {
            req: (req) => ({
                method: req.method,
                url: req.url,
                path: req.path,
                params: req.params,
                query: req.query,
                correlationId: req.headers?.['x-correlation-id'],
                userAgent: req.headers?.['user-agent'],
                ip: req.ip || req.headers?.['x-forwarded-for'],
            }),
            res: (res) => ({
                statusCode: res.statusCode,
            }),
            err: pino.stdSerializers.err,
        },

        // Pretty print in development
        ...(isDevelopment && {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid,hostname',
                    singleLine: false,
                },
            },
        }),
    };

    return pino(options);
}

// Default logger instance
export const logger = createLogger();

/**
 * Create child logger with additional context
 */
export function createChildLogger(context: string, bindings?: Record<string, unknown>): Logger {
    return logger.child({ context, ...bindings });
}

/**
 * Log levels with semantic meaning
 */
export const LogLevels = {
    fatal: 60,  // Application crash
    error: 50,  // Error that needs attention
    warn: 40,   // Warning, potential issue
    info: 30,   // Normal operation
    debug: 20,  // Debug information
    trace: 10,  // Detailed tracing
} as const;

/**
 * Structured log message helpers
 */
export const LogMessages = {
    // HTTP
    httpRequest: (method: string, path: string) => `${method} ${path}`,
    httpResponse: (method: string, path: string, status: number, duration: number) =>
        `${method} ${path} - ${status} (${duration}ms)`,

    // Auth
    loginAttempt: (email: string) => `Login attempt: ${email}`,
    loginSuccess: (userId: string) => `Login successful: ${userId}`,
    loginFailure: (email: string, reason: string) => `Login failed: ${email} - ${reason}`,

    // Database
    queryStart: (operation: string, model: string) => `DB ${operation} on ${model}`,
    queryEnd: (operation: string, model: string, duration: number) =>
        `DB ${operation} on ${model} completed (${duration}ms)`,

    // Business
    entityCreated: (type: string, id: string) => `Created ${type}: ${id}`,
    entityUpdated: (type: string, id: string) => `Updated ${type}: ${id}`,
    entityDeleted: (type: string, id: string) => `Deleted ${type}: ${id}`,
};
