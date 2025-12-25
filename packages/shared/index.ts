/**
 * @diet/shared - Main exports
 * Central package for shared types, schemas, API client, and utilities
 * Used across web, mobile, and backend applications
 */

// Error handling exports
export * from './errors/index';
export * from './errors/error.class';
export * from './errors/error.utils';

// Type definitions
export * from './types/index';

// Validation schemas
export * from './schemas/index';

// API client
export * from './api-client/index';

// Pagination
export * from './pagination/index';
export * from './pagination/pagination.schema';

// Advanced Authentication
export * from './auth/advanced-auth.types';
export * from './auth/auth.schema';
export * from './auth/totp.utils';

// Soft Delete & Audit Logging
export * from './audit/audit.types';
export * from './audit/audit.schema';
export * from './audit/audit.utils';

// Utils
export * from './utils/index';
