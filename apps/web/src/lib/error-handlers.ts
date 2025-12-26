import {
    AppError,
    ErrorResponse,
    handleHttpError,
    isAppError,
    isValidationError,
} from '@diet/shared/errors';
import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * Response Interceptor for handling API errors
 * Converts API error responses to AppError instances
 * Used in web app's API client initialization
 */
export function setupErrorInterceptor(apiClient: AxiosInstance): void {
    apiClient.interceptors.response.use(
        (response) => response,
        (error: AxiosError<ErrorResponse> | unknown) => {
            const traceId = axios.defaults.headers.common['X-Trace-ID'] as string | undefined;

            if (axios.isAxiosError(error)) {
                // Handle HTTP error
                const appError = handleHttpError(error, traceId);
                return Promise.reject(appError);
            }

            // Handle non-HTTP error
            return Promise.reject(
                new AppError(
                    'UNKNOWN_ERROR' as any,
                    error instanceof Error ? error.message : 'An unknown error occurred',
                    undefined,
                    undefined,
                    undefined,
                    traceId,
                ),
            );
        },
    );
}

/**
 * Hook to handle API errors with notification
 * Shows user-friendly error messages
 */
export function useApiErrorHandler() {
    const handleError = (error: unknown) => {
        let appError: AppError;

        if (isAppError(error)) {
            appError = error;
        } else {
            appError = new AppError(
                'UNKNOWN_ERROR' as any,
                error instanceof Error ? error.message : 'An error occurred',
            );
        }

        // Show error notification (integrate with your notification system)
        console.error('API Error:', appError.code, appError.message);

        // Don't show validation errors as toasts (they go in form)
        if (!isValidationError(appError)) {
            // notificationStore.addError(appError.message, appError.code);
        }

        return appError;
    };

    return { handleError };
}

/**
 * Hook for handling validation errors in forms
 */
export function useValidationErrorHandler() {
    const handleValidationError = (error: unknown) => {
        if (isValidationError(error)) {
            return error.details || {};
        }

        if (isAppError(error)) {
            return { form: error.message };
        }

        return { form: error instanceof Error ? error.message : 'Validation failed' };
    };

    return { handleValidationError };
}
