import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { AppError, isAppError } from '@diet/shared/errors';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * React Native Error Boundary Component
 * Catches errors from child components and displays error UI
 * Used in Expo mobile app
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

        // Send to error tracking service
        if (global.__errorTracker) {
            global.__errorTracker.captureException(error, {
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
 * Default Error Boundary Fallback UI for React Native
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
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    {/* Error Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>⚠️</Text>
                    </View>

                    {/* Error Title */}
                    <Text style={styles.title}>Something went wrong</Text>

                    {/* Error Message */}
                    <Text style={styles.message}>{errorMessage}</Text>

                    {/* Error Code */}
                    {isAppErrorInstance && (
                        <Text style={styles.errorCode}>
                            Error Code: {errorCode}
                        </Text>
                    )}

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={onReset}
                        >
                            <Text style={styles.primaryButtonText}>
                                Try Again
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => {
                                // Navigate to home
                                // Implementation depends on your navigation setup
                            }}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Go Home
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Development Details */}
                    {process.env.NODE_ENV === 'development' && (
                        <View style={styles.detailsContainer}>
                            <Text style={styles.detailsTitle}>
                                Error Details (Development Only)
                            </Text>
                            <ScrollView
                                style={styles.detailsScroll}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.detailsText}>
                                    {error.stack}
                                </Text>
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 48,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 14,
        color: '#4b5563',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 20,
    },
    errorCode: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Courier New',
    },
    buttonContainer: {
        gap: 12,
        marginBottom: 16,
    },
    primaryButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#e5e7eb',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#1f2937',
        fontSize: 16,
        fontWeight: '600',
    },
    detailsContainer: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
    },
    detailsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    detailsScroll: {
        maxHeight: 200,
    },
    detailsText: {
        fontSize: 10,
        color: '#4b5563',
        fontFamily: 'Courier New',
        lineHeight: 14,
    },
});

/**
 * Type augmentation for global object (error tracking)
 */
declare global {
    var __errorTracker: {
        captureException: (error: Error, context?: Record<string, unknown>) => void;
        captureMessage: (message: string, level?: string) => void;
    } | undefined;
}
