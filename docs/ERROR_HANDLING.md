# Error Handling & Standardization - Implementation Guide

## Overview

This document describes the standardized error handling system implemented across the diet-plan-ai application. The system provides:

- **Unified Error Codes**: Centralized error code dictionary for all layers
- **Structured Error Responses**: Consistent API error response format
- **Type-Safe Error Classes**: Specialized error classes for different scenarios
- **Error Boundaries**: React and React Native error UI components
- **Global Exception Filter**: NestJS filter for automatic error standardization
- **i18n Support**: Translation keys for internationalization

## Architecture

### Error Code Dictionary (`packages/shared/errors/index.ts`)

Defines all error codes in a single `ErrorCode` enum with categories:

```typescript
// Authentication & Authorization
AUTH_UNAUTHORIZED, AUTH_FORBIDDEN, AUTH_INVALID_CREDENTIALS, AUTH_TOKEN_EXPIRED

// Validation
VALIDATION_ERROR, VALIDATION_INVALID_EMAIL, VALIDATION_PASSWORD_WEAK

// Resources
NOT_FOUND_USER, NOT_FOUND_CLIENT, NOT_FOUND_DIET_PLAN

// Business Logic
BUSINESS_INVALID_STATE_TRANSITION, BUSINESS_RULE_VIOLATION

// Network
NETWORK_ERROR, NETWORK_TIMEOUT, NETWORK_OFFLINE

// Server
SERVER_INTERNAL_ERROR, SERVER_UNAVAILABLE
```

**Benefits:**
- Single source of truth for all error codes
- Type-safe error handling with `ErrorCode` enum
- Consistent error codes across web, mobile, and API
- Easy to extend for new error types

### Error Response Format

All API errors follow a standardized format:

```typescript
interface ErrorResponse {
    code: ErrorCode;           // Machine-readable error code
    message: string;           // User-friendly error message
    statusCode: number;        // HTTP status code
    timestamp: string;         // ISO 8601 timestamp
    path?: string;             // Request path (from API)
    details?: Record<string, string | string[]>;  // Validation details
    traceId?: string;          // Distributed tracing ID
    context?: Record<string, unknown>;  // Additional context
}
```

**Example Error Response:**

```json
{
    "code": "VALIDATION_ERROR",
    "message": "Please check the form for errors",
    "statusCode": 422,
    "timestamp": "2024-12-24T10:30:00Z",
    "path": "/api/users",
    "details": {
        "email": "Invalid email format",
        "password": [
            "Must be at least 8 characters",
            "Must contain uppercase letter"
        ]
    },
    "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Classes (`packages/shared/errors/error.class.ts`)

Specialized error classes for different scenarios:

#### AppError (Base Class)
```typescript
new AppError(
    code: ErrorCode,
    message?: string,
    statusCode?: number,
    details?: Record<string, string | string[]>,
    context?: Record<string, unknown>,
    traceId?: string
)
```

#### ValidationError
```typescript
new ValidationError(
    details: Record<string, string | string[]>,
    message?: string
)
// Example:
throw new ValidationError({
    email: 'Invalid email format',
    password: 'Must be at least 8 characters'
});
```

#### NotFoundError
```typescript
throw new NotFoundError('Diet Plan');
// Generates: "Diet Plan not found" with NOT_FOUND status
```

#### ConflictError
```typescript
throw new ConflictError(
    'Email already registered',
    ErrorCode.DUPLICATE_EMAIL
);
```

#### AuthenticationError & AuthorizationError
```typescript
throw new AuthenticationError(ErrorCode.TOKEN_EXPIRED);
throw new AuthorizationError('Insufficient permissions');
```

#### BusinessLogicError
```typescript
throw new BusinessLogicError(
    'Cannot delete an active diet plan',
    ErrorCode.CANNOT_DELETE_ACTIVE_PLAN
);
```

### NestJS Global Exception Filter (`packages/infrastructure/exceptions/global-exception.filter.ts`)

Automatically catches and standardizes all exceptions:

```typescript
// In main.ts
import { GlobalExceptionFilter, setupGlobalExceptionHandling } from '@diet/infrastructure';

app.useGlobalFilters(new GlobalExceptionFilter());
setupGlobalExceptionHandling();
```

**Features:**
- Converts NestJS HttpExceptions to AppError
- Handles Zod validation errors
- Maps HTTP status codes to error codes
- Logs errors with appropriate levels
- Strips sensitive context in production
- Preserves trace IDs for distributed tracing

### React Error Boundary (`apps/web/src/components/ErrorBoundary.tsx`)

Catches rendering errors and displays error UI:

```typescript
<ErrorBoundary onError={handleError} fallback={CustomErrorUI}>
    <App />
</ErrorBoundary>
```

**Features:**
- Catches component rendering errors
- Displays user-friendly error UI
- Integration with error tracking (Sentry)
- Development-only error stack traces
- Reset and retry functionality

### React Native Error Boundary (`apps/mobile/src/components/ErrorBoundary.tsx`)

Similar to React version but optimized for React Native:

```typescript
<ErrorBoundary onError={handleError}>
    <AppNavigator />
</ErrorBoundary>
```

## Usage Patterns

### Backend: Throwing Errors in Use Cases

```typescript
// In a use case or service
export class CreateDietPlanUseCase {
    async execute(input: CreateDietPlanInput) {
        // Validate input
        const schema = createDietPlanSchema;
        const result = schema.safeParse(input);
        if (!result.success) {
            throw new ValidationError(
                extractValidationDetails(result.error)
            );
        }

        // Check business rules
        const existingPlan = await this.dietPlanRepo.findByUserAndDate(
            input.userId,
            input.date
        );
        if (existingPlan) {
            throw new ConflictError(
                'Diet plan already exists for this date',
                ErrorCode.RESOURCE_ALREADY_EXISTS
            );
        }

        // Create plan
        const plan = DietPlan.create(input);
        return this.dietPlanRepo.save(plan);
    }
}
```

### Frontend: Handling API Errors in React

```typescript
// In a React component
function CreateDietPlanForm() {
    const [fieldErrors, setFieldErrors] = useState({});
    const { handleError } = useApiErrorHandler();
    const { handleValidationError } = useValidationErrorHandler();

    async function handleSubmit(data: CreateDietPlanInput) {
        try {
            await createDietPlan(data);
            // Success handling
        } catch (error) {
            const appError = handleError(error);

            if (isValidationError(appError)) {
                setFieldErrors(handleValidationError(error));
            } else {
                // Show notification toast
                showNotification(appError.message, 'error');
            }
        }
    }

    return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### Mobile: Handling Errors in React Native

```typescript
// In a React Native component
function CreateDietPlanScreen() {
    const [fieldErrors, setFieldErrors] = useState({});
    const { handleError } = useApiErrorHandler();

    async function handleSubmit(data: CreateDietPlanInput) {
        try {
            await createDietPlan(data);
        } catch (error) {
            const appError = handleError(error);

            if (isValidationError(appError)) {
                setFieldErrors(appError.details || {});
            } else {
                // Show alert
                Alert.alert(
                    'Error',
                    appError.message,
                    [{ text: 'OK' }]
                );
            }
        }
    }

    return (
        <SafeAreaView>
            {/* Form fields */}
        </SafeAreaView>
    );
}
```

## i18n Integration

Map error codes to translation keys:

```typescript
// In i18n configuration
const translations = {
    'en': {
        'error.AUTH_UNAUTHORIZED': 'Please log in to continue',
        'error.AUTH_FORBIDDEN': 'You do not have permission',
        'error.VALIDATION_ERROR': 'Please check the form',
        'error.NOT_FOUND': 'Resource not found',
        'error.NETWORK_ERROR': 'Network connection error',
        // ... more translations
    },
    'tr': {
        'error.AUTH_UNAUTHORIZED': 'Devam etmek için giriş yapın',
        'error.AUTH_FORBIDDEN': 'Bunu yapmak için izniniz yok',
        // ... Turkish translations
    }
};

// Use in component
function ErrorMessage({ error }: { error: AppError }) {
    const { t } = useTranslation();
    const key = getErrorI18nKey(error.code);
    return <div>{t(key, { defaultValue: error.message })}</div>;
}
```

## Retry Logic

Errors are automatically retried based on error type:

```typescript
// Automatically handled in API client
const config = getRetryConfig(error, attemptCount);

if (config.shouldRetry) {
    // Wait for delay
    await sleep(config.delayMs);
    // Retry request
}
```

**Retry Rules:**
- Network errors: 3 retries with exponential backoff
- Rate limit (429): 5 retries with longer backoff
- Server errors (5xx): 3 retries with exponential backoff
- Client errors (4xx): No retry (except 408, 429)
- Auth errors: No retry (trigger logout)

## Error Tracking Integration

Setup error tracking (Sentry example):

```typescript
// In web app
import * as Sentry from '@sentry/react';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    integrations: [
        new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
});

// In ErrorBoundary
window.__errorTracker = {
    captureException: (error, context) => {
        Sentry.captureException(error, { contexts: context });
    },
    captureMessage: (message, level) => {
        Sentry.captureMessage(message, (level as any) || 'error');
    },
};
```

## Best Practices

1. **Always throw typed errors**: Use specific error classes instead of generic `new Error()`

   ```typescript
   // ❌ Bad
   throw new Error('Validation failed');

   // ✅ Good
   throw new ValidationError({ email: 'Invalid format' });
   ```

2. **Include context for debugging**: Pass additional data for investigation

   ```typescript
   throw new AppError(
       ErrorCode.DATABASE_ERROR,
       'Failed to save diet plan',
       500,
       undefined,
       { userId, planId, attemptCount }
   );
   ```

3. **Use validation errors for form validation**: Never throw generic errors for form inputs

   ```typescript
   throw new ValidationError({
       email: 'Already registered',
       password: ['Too weak', 'Must contain special character']
   });
   ```

4. **Map business rule violations to specific error codes**:

   ```typescript
   // ❌ Bad
   if (plan.isActive) {
       throw new Error('Cannot delete active plan');
   }

   // ✅ Good
   if (plan.isActive) {
       throw new BusinessLogicError(
           'Cannot delete an active diet plan',
           ErrorCode.CANNOT_DELETE_ACTIVE_PLAN
       );
   }
   ```

5. **Don't expose sensitive information**: Context is removed in production

   ```typescript
   // Safe to include detailed context for debugging
   throw new AppError(
       ErrorCode.INTERNAL_SERVER_ERROR,
       'An error occurred',
       500,
       undefined,
       { 
           userId,        // Safe to log
           query,         // Safe to log
           exception: err // Removed in production
       }
   );
   ```

## Testing

Example error handling in tests:

```typescript
describe('CreateDietPlanUseCase', () => {
    it('should throw ValidationError for invalid input', async () => {
        const useCase = new CreateDietPlanUseCase(repo);

        expect(() => useCase.execute({})).rejects.toThrow(ValidationError);
        expect(() => useCase.execute({})).rejects.toMatchObject({
            code: ErrorCode.VALIDATION_ERROR,
            statusCode: 422,
        });
    });

    it('should throw ConflictError if plan exists', async () => {
        // Setup existing plan
        repo.findByUserAndDate.mockResolvedValue(existingPlan);

        const useCase = new CreateDietPlanUseCase(repo);

        expect(() => useCase.execute(input)).rejects.toThrow(ConflictError);
        expect(() => useCase.execute(input)).rejects.toMatchObject({
            code: ErrorCode.RESOURCE_ALREADY_EXISTS,
            statusCode: 409,
        });
    });
});
```

## Next Steps

1. Integrate error tracking (Sentry, LogRocket, etc.)
2. Set up error metrics and monitoring
3. Create error rate dashboards
4. Implement automatic error recovery strategies
5. Add error recovery suggestions to UI
6. Set up alerting for critical errors
