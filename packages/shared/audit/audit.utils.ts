/**
 * Audit Logging Utilities
 *
 * Helper functions for generating audit trails, calculating diffs,
 * and formatting audit data for compliance reports.
 */

import { AuditChange, AuditTrail, AuditAction, AuditEntityType, ChangeSnapshot } from './audit.types';

/**
 * Calculates differences between two objects
 */
export function calculateDiff(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>,
): AuditChange[] {
  const changes: AuditChange[] = [];
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  for (const key of allKeys) {
    const old = oldValues[key];
    const newVal = newValues[key];

    // Deep equality check for objects
    if (JSON.stringify(old) !== JSON.stringify(newVal)) {
      changes.push({
        field: key,
        oldValue: old,
        newValue: newVal,
      });
    }
  }

  return changes;
}

/**
 * Creates a change snapshot for comparison
 */
export function createChangeSnapshot(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): ChangeSnapshot {
  const diff = calculateDiff(before, after);

  return {
    before,
    after,
    timestamp: new Date(),
    diff,
  };
}

/**
 * Formats audit trail for display
 */
export function formatAuditTrail(audit: AuditTrail): string {
  return `${audit.action} ${audit.entityType} (${audit.entityId}) by ${audit.userEmail || audit.userId} at ${audit.timestamp.toISOString()}`;
}

/**
 * Generates a summary of changes for display
 */
export function summarizeChanges(changes: AuditChange[]): string {
  if (changes.length === 0) return 'No changes';
  if (changes.length === 1) {
    const change = changes[0];
    return `${change.field}: ${JSON.stringify(change.oldValue)} → ${JSON.stringify(change.newValue)}`;
  }
  return `${changes.length} fields changed`;
}

/**
 * Filters sensitive fields from audit records (e.g., passwords, tokens)
 */
export function sanitizeAuditData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'refreshToken', 'accessToken'];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Redacts changes containing sensitive data
 */
export function redactSensitiveChanges(changes: AuditChange[]): AuditChange[] {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'refreshToken', 'accessToken'];

  return changes.map((change) => {
    if (sensitiveFields.includes(change.field.toLowerCase())) {
      return {
        ...change,
        oldValue: '[REDACTED]',
        newValue: '[REDACTED]',
      };
    }
    return change;
  });
}

/**
 * Determines risk level based on action and entity type
 */
export function calculateRiskLevel(
  action: AuditAction,
  entityType: AuditEntityType,
  changes?: AuditChange[],
): 'LOW' | 'MEDIUM' | 'HIGH' {
  // High risk actions
  const highRiskActions = [AuditAction.DELETE, AuditAction.BULK_DELETE, AuditAction.BULK_UPDATE];
  if (highRiskActions.includes(action)) return 'HIGH';

  // High risk entity types
  const highRiskEntities = [AuditEntityType.USER, AuditEntityType.PAYMENT, AuditEntityType.SUBSCRIPTION];
  if (highRiskEntities.includes(entityType) && [AuditAction.UPDATE, AuditAction.DELETE].includes(action)) {
    return 'HIGH';
  }

  // Medium risk
  const mediumRiskActions = [AuditAction.UPDATE, AuditAction.APPROVE, AuditAction.REJECT];
  if (mediumRiskActions.includes(action)) return 'MEDIUM';

  return 'LOW';
}

/**
 * Groups audit trails by entity
 */
export function groupAuditsByEntity(audits: AuditTrail[]): Map<string, AuditTrail[]> {
  const grouped = new Map<string, AuditTrail[]>();

  for (const audit of audits) {
    const key = `${audit.entityType}:${audit.entityId}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(audit);
  }

  return grouped;
}

/**
 * Groups audit trails by user
 */
export function groupAuditsByUser(audits: AuditTrail[]): Map<string, AuditTrail[]> {
  const grouped = new Map<string, AuditTrail[]>();

  for (const audit of audits) {
    const key = audit.userId;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(audit);
  }

  return grouped;
}

/**
 * Groups audit trails by action
 */
export function groupAuditsByAction(audits: AuditTrail[]): Map<AuditAction, AuditTrail[]> {
  const grouped = new Map<AuditAction, AuditTrail[]>();

  for (const audit of audits) {
    if (!grouped.has(audit.action)) {
      grouped.set(audit.action, []);
    }
    grouped.get(audit.action)!.push(audit);
  }

  return grouped;
}

/**
 * Counts audit actions by type
 */
export function countAuditActions(audits: AuditTrail[]): Record<AuditAction, number> {
  const counts: Record<string, number> = {};

  for (const audit of audits) {
    counts[audit.action] = (counts[audit.action] || 0) + 1;
  }

  return counts as Record<AuditAction, number>;
}

/**
 * Counts audit entities by type
 */
export function countAuditEntities(audits: AuditTrail[]): Record<AuditEntityType, number> {
  const counts: Record<string, number> = {};

  for (const audit of audits) {
    counts[audit.entityType] = (counts[audit.entityType] || 0) + 1;
  }

  return counts as Record<AuditEntityType, number>;
}

/**
 * Filters audits by date range
 */
export function filterByDateRange(
  audits: AuditTrail[],
  startDate: Date,
  endDate: Date,
): AuditTrail[] {
  return audits.filter((audit) => audit.timestamp >= startDate && audit.timestamp <= endDate);
}

/**
 * Filters audits by risk level
 */
export function filterByRiskLevel(audits: AuditTrail[], riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): AuditTrail[] {
  return audits.filter((audit) => {
    const level = audit.metadata?.riskLevel || calculateRiskLevel(audit.action, audit.entityType, audit.changes);
    return level === riskLevel;
  });
}

/**
 * Exports audits to CSV format
 */
export function exportAuditsToCsv(audits: AuditTrail[]): string {
  const headers = [
    'ID',
    'Entity Type',
    'Entity ID',
    'Action',
    'User Email',
    'User ID',
    'Timestamp',
    'IP Address',
    'Device ID',
    'Changes',
    'Risk Level',
  ];

  const rows = audits.map((audit) => [
    audit.id,
    audit.entityType,
    audit.entityId,
    audit.action,
    audit.userEmail || '',
    audit.userId,
    audit.timestamp.toISOString(),
    audit.ipAddress || '',
    audit.deviceId || '',
    audit.changes ? JSON.stringify(audit.changes) : '',
    audit.metadata?.riskLevel || calculateRiskLevel(audit.action, audit.entityType),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Generates audit report summary
 */
export function generateAuditSummary(audits: AuditTrail[]) {
  return {
    totalAudits: audits.length,
    dateRange: {
      start: audits.length > 0 ? audits[audits.length - 1].timestamp : new Date(),
      end: audits.length > 0 ? audits[0].timestamp : new Date(),
    },
    actionCounts: countAuditActions(audits),
    entityCounts: countAuditEntities(audits),
    userCount: new Set(audits.map((a) => a.userId)).size,
    highRiskEvents: filterByRiskLevel(audits, 'HIGH').length,
    mediumRiskEvents: filterByRiskLevel(audits, 'MEDIUM').length,
  };
}
