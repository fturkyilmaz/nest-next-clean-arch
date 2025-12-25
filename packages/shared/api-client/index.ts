import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

/**
 * Centralized API Client for Web, Mobile, and Backend
 * Provides unified error handling, request/response interceptors, and retry logic
 */

// ============================================
// Configuration & Interfaces
// ============================================

export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    getAccessToken?: () => string | null;
    onTokenExpired?: () => void;
    onError?: (error: ApiError) => void;
    getRefreshToken?: () => string | null;
    onRefreshToken?: (tokens: { accessToken: string; refreshToken: string; expiresIn: number }) => void;
    enableRetry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
}

export interface ApiError {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    timestamp?: string;
    errors?: Record<string, string[]>;
    code?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ============================================
// Retry Configuration with Exponential Backoff
// ============================================

interface RetryConfig {
    maxRetries: number;
    delay: number;
    backoffMultiplier: number;
    maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    delay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
};

// ============================================
// API Client Factory
// ============================================

/**
 * Create configured API client instance with advanced interceptors
 * Handles authentication, token refresh, error handling, and retry logic
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
    const client = axios.create({
        baseURL: config.baseURL,
        timeout: config.timeout || 30000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    let isRefreshing = false;
    let refreshSubscribers: Array<(token: string) => void> = [];

    const onRefreshed = (token: string) => {
        refreshSubscribers.forEach((callback) => callback(token));
        refreshSubscribers = [];
    };

    // ============================================
    // Request Interceptor - Add Auth Token
    // ============================================
    client.interceptors.request.use(
        (requestConfig) => {
            const token = config.getAccessToken?.();
            if (token) {
                requestConfig.headers.Authorization = `Bearer ${token}`;
            }
            // Add correlation ID for tracing
            requestConfig.headers['X-Correlation-ID'] = generateCorrelationId();
            return requestConfig;
        },
        (error) => Promise.reject(error)
    );

    // ============================================
    // Response Interceptor - Error Handling & Token Refresh
    // ============================================
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError<ApiError>) => {
            const originalRequest = error.config as AxiosRequestConfig & { _retry?: number };

            // Handle network error
            if (!error.response) {
                const networkError: ApiError = {
                    type: 'https://httpstatuses.com/0',
                    title: 'Network Error',
                    status: 0,
                    detail: error.message || 'Unable to connect to server',
                    code: 'NETWORK_ERROR',
                };
                config.onError?.(networkError);
                return Promise.reject(networkError);
            }

            const apiError = error.response.data || {
                type: 'https://httpstatuses.com/' + error.response.status,
                title: error.response.statusText,
                status: error.response.status,
                detail: 'An error occurred',
            };

            // Handle 401 - Token Expired, attempt refresh
            if (error.response.status === 401 && config.getRefreshToken) {
                if (!isRefreshing) {
                    isRefreshing = true;

                    try {
                        const refreshToken = config.getRefreshToken();
                        if (!refreshToken) {
                            config.onTokenExpired?.();
                            return Promise.reject(apiError);
                        }

                        // Call refresh token endpoint
                        const response = await axios.post(`${config.baseURL}/auth/refresh`, {
                            refreshToken,
                        });

                        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
                        config.onRefreshToken?.({ accessToken, refreshToken: newRefreshToken, expiresIn });

                        isRefreshing = false;
                        onRefreshed(accessToken);

                        // Retry original request with new token
                        if (originalRequest) {
                            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                            return client(originalRequest);
                        }
                    } catch (refreshError) {
                        isRefreshing = false;
                        config.onTokenExpired?.();
                        return Promise.reject(apiError);
                    }
                }

                // Queue request while token is being refreshed
                return new Promise((resolve) => {
                    refreshSubscribers.push((token: string) => {
                        if (originalRequest) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(client(originalRequest));
                        }
                    });
                });
            }

            // Implement exponential backoff retry for idempotent requests
            if (config.enableRetry && shouldRetry(error) && (!originalRequest._retry || originalRequest._retry < DEFAULT_RETRY_CONFIG.maxRetries)) {
                originalRequest._retry = (originalRequest._retry || 0) + 1;
                const delay = calculateBackoffDelay(originalRequest._retry, DEFAULT_RETRY_CONFIG);

                await sleep(delay);
                return client(originalRequest);
            }

            // Enhance error with code for i18n
            if (!apiError.code) {
                apiError.code = mapHttpStatusToErrorCode(error.response.status);
            }

            config.onError?.(apiError);
            return Promise.reject(apiError);
        }
    );

    return client;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate unique correlation ID for request tracing
 */
function generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determine if request should be retried
 */
function shouldRetry(error: AxiosError): boolean {
    if (!error.response) {
        return true; // Retry network errors
    }

    const status = error.response.status;
    const method = error.config?.method?.toUpperCase();

    // Retry safe methods on specific status codes
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const safeIdempotentMethods = ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];

    return retryableStatuses.includes(status) && safeIdempotentMethods.includes(method || 'GET');
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoffDelay(retryCount: number, config: RetryConfig): number {
    const exponentialDelay = config.delay * Math.pow(config.backoffMultiplier, retryCount - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    const delay = Math.min(exponentialDelay + jitter, config.maxDelay);
    return Math.floor(delay);
}

/**
 * Sleep utility for retries
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Map HTTP status codes to standardized error codes
 */
function mapHttpStatusToErrorCode(status: number): string {
    const statusMap: Record<number, string> = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        409: 'CONFLICT',
        422: 'VALIDATION_ERROR',
        429: 'RATE_LIMITED',
        500: 'INTERNAL_SERVER_ERROR',
        502: 'BAD_GATEWAY',
        503: 'SERVICE_UNAVAILABLE',
    };
    return statusMap[status] || 'UNKNOWN_ERROR';
}

// Re-export types and schemas from shared packages
export * from '../types';
export * from '../schemas';
