/**
 * Audit Logging Types
 *
 * Core types for audit trail tracking, changes recording, and compliance logging.
 * Supports tracking of all entity modifications with full change history.
 */

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SHARE = 'SHARE',
  UNSHARE = 'UNSHARE',
  PUBLISH = 'PUBLISH',
  ARCHIVE = 'ARCHIVE',
  BULK_UPDATE = 'BULK_UPDATE',
  BULK_DELETE = 'BULK_DELETE',
}

export enum AuditEntityType {
  USER = 'USER',
  DIET_PLAN = 'DIET_PLAN',
  MEAL = 'MEAL',
  FOOD = 'FOOD',
  INGREDIENT = 'INGREDIENT',
  RECIPE = 'RECIPE',
  NUTRITION_LOG = 'NUTRITION_LOG',
  APPOINTMENT = 'APPOINTMENT',
  METRIC = 'METRIC',
  REPORT = 'REPORT',
  PREFERENCE = 'PREFERENCE',
  PAYMENT = 'PAYMENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export interface AuditTrail {
  id: string;
  entityId: string;
  entityType: AuditEntityType;
  action: AuditAction;
  userId: string;
  userEmail?: string;
  changes?: AuditChange[];
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: AuditMetadata;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  deviceId?: string;
  timestamp: Date;
  createdAt: Date;
}

export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditMetadata {
  source?: 'WEB' | 'MOBILE' | 'API' | 'ADMIN_PANEL' | 'AUTOMATION';
  reason?: string;
  correlationId?: string;
  relatedEntityIds?: string[];
  tags?: string[];
  batchId?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AuditQueryOptions {
  entityId?: string;
  entityType?: AuditEntityType;
  userId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'action' | 'userId';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditQueryResult {
  data: AuditTrail[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChangeSnapshot {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  timestamp: Date;
  diff: AuditChange[];
}

export interface AuditSummary {
  entityId: string;
  entityType: AuditEntityType;
  totalChanges: number;
  createdAt: Date;
  lastModifiedAt: Date;
  lastModifiedBy: string;
  createdBy: string;
  changeCount: Record<AuditAction, number>;
}

export interface ComplianceReport {
  reportId: string;
  startDate: Date;
  endDate: Date;
  totalActions: number;
  actionSummary: Record<AuditAction, number>;
  entitySummary: Record<AuditEntityType, number>;
  userSummary: Record<string, number>;
  riskEvents: AuditTrail[];
  dataRetention: {
    appliedRetentionDays: number;
    nextCleanupDate: Date;
    archivedRecordsCount: number;
  };
  generateDate: Date;
}

export interface SoftDeleteOptions {
  hardDelete?: boolean; // Force permanent deletion
  cascade?: boolean; // Delete related entities
  reason?: string;
  tags?: string[];
}

export interface RestoreOptions {
  restoreRelated?: boolean; // Restore cascade-deleted entities
  reason?: string;
}
