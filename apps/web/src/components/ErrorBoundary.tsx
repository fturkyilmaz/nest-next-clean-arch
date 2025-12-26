import React, { ReactNode } from 'react';
import { AppError, isAppError } from '@diet/shared/errors';

interface ErrorBoundaryProps {
    children: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * React Error Boundary Component
 * Catches errors from child components and displays error UI
 * Used in Next.js web app
 */
export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details
        console.error('Error caught by boundary:', error, errorInfo);

        // Call onError prop if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Send to error tracking service (Sentry, etc.)
        if (typeof window !== 'undefined' && window.__errorTracker) {
            window.__errorTracker.captureException(error, {
                contexts: {
                    react: {
                        componentStack: errorInfo.componentStack,
                    },
                },
            });
        }
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.resetError);
            }

            // Default error UI
            return (
                <ErrorBoundaryFallback
                    error={this.state.error}
                    onReset={this.resetError}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Default Error Boundary Fallback UI
 */
interface ErrorBoundaryFallbackProps {
    error: Error;
    onReset: () => void;
}

function ErrorBoundaryFallback({
    error,
    onReset,
}: ErrorBoundaryFallbackProps) {
    const isAppErrorInstance = isAppError(error);
    const errorCode = isAppErrorInstance ? error.code : 'UNKNOWN_ERROR';
    const errorMessage = error.message;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center justify-center h-12 w-12 mx-auto bg-red-100 rounded-full">
                    <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <h1 className="mt-4 text-lg font-medium text-gray-900 text-center">
                    Something went wrong
                </h1>

                <p className="mt-2 text-sm text-gray-600 text-center">
                    {errorMessage}
                </p>

                {isAppErrorInstance && (
                    <p className="mt-1 text-xs text-gray-500 text-center font-mono">
                        Error Code: {errorCode}
                    </p>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onReset}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => (window.location.href = '/')}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        Home
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-700">
                        <summary className="cursor-pointer font-medium mb-2">
                            Error Details (Development Only)
                        </summary>
                        <pre className="overflow-auto whitespace-pre-wrap break-words">
                            {error.stack}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
}

/**
 * Hook to handle async errors in Next.js Server Components
 * Use in page.tsx or layout.tsx files
 */
export async function handleServerError(
    fn: () => Promise<void>,
) {
    try {
        await fn();
    } catch (error) {
        console.error('Server error:', error);
        throw error;
    }
}

/**
 * Type augmentation for window object (error tracking)
 */
declare global {
    interface Window {
        __errorTracker?: {
            captureException: (error: Error, context?: Record<string, unknown>) => void;
            captureMessage: (message: string, level?: string) => void;
        };
    }
}
