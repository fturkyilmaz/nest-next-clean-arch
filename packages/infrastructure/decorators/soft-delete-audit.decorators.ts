/**
 * Soft Delete & Audit Logging NestJS Decorators
 *
 * Decorators for automatically logging and soft-deleting entities.
 */

import { SetMetadata } from '@nestjs/common';
import { AuditAction, AuditEntityType } from '@diet/shared';

/**
 * Mark a controller method for automatic audit logging
 */
export const Audit = (
  entityType: AuditEntityType,
  action: AuditAction,
  options?: {
    captureRequest?: boolean;
    captureResponse?: boolean;
    sensitiveFields?: string[];
  },
) => SetMetadata('audit', { entityType, action, options });

/**
 * Mark a controller method for automatic soft delete handling
 */
export const SoftDeleteable = (entityType: AuditEntityType) => SetMetadata('softDeleteable', { entityType });

/**
 * Allow reading deleted records in a query
 */
export const IncludeDeleted = () => SetMetadata('includeDeleted', true);

/**
 * Only return deleted records
 */
export const OnlyDeleted = () => SetMetadata('onlyDeleted', true);

/**
 * Enforce cascade deletion
 */
export const CascadeDelete = (relatedEntities?: AuditEntityType[]) =>
  SetMetadata('cascadeDelete', { enabled: true, relatedEntities });

/**
 * Mark fields that should be redacted from audit logs
 */
export const SensitiveAuditField = () => {
  return function (target: unknown, propertyKey: string | symbol | undefined): void {};
};
