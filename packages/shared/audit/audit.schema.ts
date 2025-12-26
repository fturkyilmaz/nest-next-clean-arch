/**
 * Audit Logging Zod Schemas
 *
 * Validation schemas for audit trail queries, filtering, and compliance reports.
 * Ensures type-safe audit operations across the application.
 */

import { z } from 'zod';
import { AuditAction, AuditEntityType } from './audit.types';

export const auditActionSchema = z.enum([
  AuditAction.CREATE,
  AuditAction.UPDATE,
  AuditAction.DELETE,
  AuditAction.RESTORE,
  AuditAction.IMPORT,
  AuditAction.EXPORT,
  AuditAction.APPROVE,
  AuditAction.REJECT,
  AuditAction.SHARE,
  AuditAction.UNSHARE,
  AuditAction.PUBLISH,
  AuditAction.ARCHIVE,
  AuditAction.BULK_UPDATE,
  AuditAction.BULK_DELETE,
]);

export const auditEntityTypeSchema = z.enum([
  AuditEntityType.USER,
  AuditEntityType.DIET_PLAN,
  AuditEntityType.MEAL,
  AuditEntityType.FOOD,
  AuditEntityType.INGREDIENT,
  AuditEntityType.RECIPE,
  AuditEntityType.NUTRITION_LOG,
  AuditEntityType.APPOINTMENT,
  AuditEntityType.METRIC,
  AuditEntityType.REPORT,
  AuditEntityType.PREFERENCE,
  AuditEntityType.PAYMENT,
  AuditEntityType.SUBSCRIPTION,
]);

export const auditChangeSchema = z.object({
  field: z.string().min(1),
  oldValue: z.unknown(),
  newValue: z.unknown(),
});

export const auditMetadataSchema = z.object({
  source: z.enum(['WEB', 'MOBILE', 'API', 'ADMIN_PANEL', 'AUTOMATION']).optional(),
  reason: z.string().max(500).optional(),
  correlationId: z.string().optional(),
  relatedEntityIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  batchId: z.string().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export const softDeleteSchema = z.object({
  hardDelete: z.boolean().default(false),
  cascade: z.boolean().default(false),
  reason: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

export const restoreSchema = z.object({
  restoreRelated: z.boolean().default(false),
  reason: z.string().max(500).optional(),
});

export const auditQuerySchema = z.object({
  entityId: z.string().optional(),
  entityType: auditEntityTypeSchema.optional(),
  userId: z.string().optional(),
  action: auditActionSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['timestamp', 'action', 'userId']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const auditLogSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  entityType: auditEntityTypeSchema,
  action: auditActionSchema,
  userId: z.string(),
  userEmail: z.string().email().optional(),
  changes: z.array(auditChangeSchema).optional(),
  oldValues: z.record(z.unknown()).optional(),
  newValues: z.record(z.unknown()).optional(),
  metadata: auditMetadataSchema.optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  deviceId: z.string().optional(),
  timestamp: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export const complianceReportSchema = z.object({
  reportId: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  totalActions: z.number().int().min(0),
  actionSummary: z.record(z.number().int()),
  entitySummary: z.record(z.number().int()),
  userSummary: z.record(z.number().int()),
  riskEvents: z.array(auditLogSchema),
  dataRetention: z.object({
    appliedRetentionDays: z.number().int().min(0),
    nextCleanupDate: z.coerce.date(),
    archivedRecordsCount: z.number().int().min(0),
  }),
  generateDate: z.coerce.date(),
});

// Inferred types
export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditEntityType = z.infer<typeof auditEntityTypeSchema>;
export type AuditChange = z.infer<typeof auditChangeSchema>;
export type AuditMetadata = z.infer<typeof auditMetadataSchema>;
export type SoftDelete = z.infer<typeof softDeleteSchema>;
export type Restore = z.infer<typeof restoreSchema>;
export type AuditQuery = z.infer<typeof auditQuerySchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type ComplianceReport = z.infer<typeof complianceReportSchema>;
