# Testing Guide

## Overview
This project uses a comprehensive testing strategy with multiple layers:
- **Unit Tests**: Domain entities, value objects, and services
- **Integration Tests**: Repository implementations with Testcontainers
- **E2E Tests**: API endpoints with Supertest
- **Load Tests**: Performance testing with k6

## Running Tests

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov
```

### Integration Tests
```bash
# Run integration tests (requires Docker)
pnpm test:integration

# Note: Testcontainers will automatically start PostgreSQL
```

### E2E Tests
```bash
# Run E2E tests
pnpm test:e2e

# Run specific E2E test file
pnpm test:e2e -- auth.e2e-spec.ts
```

### Load Tests
```bash
# Install k6 first
brew install k6  # macOS
# or download from https://k6.io/docs/getting-started/installation/

# Run load test
k6 run test/load/api-load-test.js

# Run with custom parameters
k6 run --vus 100 --duration 5m test/load/api-load-test.js
```

## Test Structure

### Unit Tests
Located in `__tests__` folders next to source files:
```
packages/domain/
  value-objects/
    __tests__/
      Weight.vo.spec.ts
  services/
    __tests__/
      BMICalculator.service.spec.ts
```

### Integration Tests
Located in `test/integration/`:
```
test/integration/
  repository.integration.spec.ts
  cache.integration.spec.ts
```

### E2E Tests
Located in `test/e2e/`:
```
test/e2e/
  auth.e2e-spec.ts
  users.e2e-spec.ts
  clients.e2e-spec.ts
```

### Load Tests
Located in `test/load/`:
```
test/load/
  api-load-test.js
  stress-test.js
```

## Coverage Requirements
- **Minimum**: 70% coverage for all metrics
- **Target**: 80%+ coverage
- **Critical paths**: 90%+ coverage

## Best Practices

### Unit Tests
- Test one thing at a time
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error conditions

### Integration Tests
- Use Testcontainers for isolation
- Clean up data between tests
- Test actual database interactions
- Verify constraints and relationships

### E2E Tests
- Test complete user flows
- Use realistic test data
- Test authentication and authorization
- Verify response formats

### Load Tests
- Start with baseline metrics
- Gradually increase load
- Monitor response times
- Identify bottlenecks

## CI/CD Integration
Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment checks

## Debugging Tests
```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test
pnpm test -- Weight.vo.spec.ts

# Show console logs
pnpm test -- --verbose
```
