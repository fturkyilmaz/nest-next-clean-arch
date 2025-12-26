/**
 * Audit Service
 *
 * Core service for logging audit trails, querying audit history,
 * and generating compliance reports.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RequestContextService } from '../middleware/request-context.service';
import {
  AuditTrail,
  AuditAction,
  AuditEntityType,
  AuditQueryOptions,
  AuditQueryResult,
  AuditMetadata,
  ComplianceReport,
  AuditSummary,
} from '@diet/shared';
import {
  calculateDiff,
  calculateRiskLevel,
  countAuditActions,
  countAuditEntities,
  filterByDateRange,
  redactSensitiveChanges,
} from '@diet/shared';

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private requestContext: RequestContextService,
  ) {}

  /**
   * Logs an audit trail for an entity change
   */
  async logAudit(
    entityType: AuditEntityType,
    entityId: string,
    action: AuditAction,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    metadata?: AuditMetadata,
  ): Promise<AuditTrail> {
    const user = this.requestContext.getUser();
    const request = this.requestContext.getRequest();
    const session = this.requestContext.getSession();

    const changes = oldValues && newValues ? calculateDiff(oldValues, newValues) : undefined;
    const redactedChanges = changes ? redactSensitiveChanges(changes) : undefined;

    const auditTrail = await this.prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        userId: user?.id || 'SYSTEM',
        userEmail: user?.email,
        changes: redactedChanges,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        metadata: JSON.stringify({
          ...metadata,
          riskLevel: calculateRiskLevel(action, entityType, changes),
        }),
        ipAddress: request?.ip,
        userAgent: request?.get('user-agent'),
        sessionId: session?.id,
        deviceId: session?.deviceId,
      },
    });

    return this.mapAuditLogToTrail(auditTrail);
  }

  /**
   * Query audit trails with filtering and pagination
   */
  async queryAudits(options: AuditQueryOptions): Promise<AuditQueryResult> {
    const {
      entityId,
      entityType,
      userId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (entityId) where.entityId = entityId;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [audits, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: audits.map((audit) => this.mapAuditLogToTrail(audit)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get audit history for a specific entity
   */
  async getEntityHistory(
    entityType: AuditEntityType,
    entityId: string,
    limit = 50,
  ): Promise<AuditTrail[]> {
    const audits = await this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return audits.map((audit) => this.mapAuditLogToTrail(audit));
  }

  /**
   * Get user's audit activity
   */
  async getUserActivity(userId: string, days = 30): Promise<AuditTrail[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const audits = await this.prisma.auditLog.findMany({
      where: {
        userId,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return audits.map((audit) => this.mapAuditLogToTrail(audit));
  }

  /**
   * Get audit summary for an entity
   */
  async getEntitySummary(entityType: AuditEntityType, entityId: string): Promise<AuditSummary> {
    const audits = await this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { timestamp: 'asc' },
    });

    if (audits.length === 0) {
      throw new Error(`No audit history found for ${entityType}:${entityId}`);
    }

    const createAudit = audits.find((a) => a.action === AuditAction.CREATE);
    const updateAudits = audits.filter((a) => a.action === AuditAction.UPDATE);
    const deleteAudit = audits.find((a) => a.action === AuditAction.DELETE);
    const lastAudit = audits[audits.length - 1];

    const actionCounts = countAuditActions(audits.map((a) => this.mapAuditLogToTrail(a)));

    return {
      entityId,
      entityType,
      totalChanges: audits.length,
      createdAt: createAudit?.timestamp || audits[0].timestamp,
      lastModifiedAt: lastAudit.timestamp,
      lastModifiedBy: lastAudit.userEmail || lastAudit.userId,
      createdBy: createAudit?.userEmail || createAudit?.userId || 'SYSTEM',
      changeCount: actionCounts,
    };
  }

  /**
   * Generate compliance report for date range
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    exportFormat: 'JSON' | 'CSV' = 'JSON',
  ): Promise<ComplianceReport> {
    const audits = await this.prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    const auditTrails = audits.map((a) => this.mapAuditLogToTrail(a));
    const actionCounts = countAuditActions(auditTrails);
    const entityCounts = countAuditEntities(auditTrails);

    const userSummary: Record<string, number> = {};
    for (const audit of auditTrails) {
      userSummary[audit.userEmail || audit.userId] = (userSummary[audit.userEmail || audit.userId] || 0) + 1;
    }

    const riskAudits = auditTrails.filter(
      (a) => (a.metadata?.riskLevel || calculateRiskLevel(a.action, a.entityType)) === 'HIGH',
    );

    const retentionDays = 90; // 90-day retention policy
    const nextCleanupDate = new Date(startDate);
    nextCleanupDate.setDate(nextCleanupDate.getDate() + retentionDays);

    return {
      reportId: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startDate,
      endDate,
      totalActions: audits.length,
      actionSummary: actionCounts,
      entitySummary: entityCounts,
      userSummary,
      riskEvents: riskAudits,
      dataRetention: {
        appliedRetentionDays: retentionDays,
        nextCleanupDate,
        archivedRecordsCount: 0,
      },
      generateDate: new Date(),
    };
  }

  /**
   * Search audits by multiple criteria
   */
  async searchAudits(
    query: string,
    filters: {
      entityType?: AuditEntityType;
      action?: AuditAction;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page = 1,
    limit = 20,
  ): Promise<AuditQueryResult> {
    const skip = (page - 1) * limit;

    const where: any = {
      ...filters,
      OR: [
        { entityId: { contains: query, mode: 'insensitive' } },
        { userEmail: { contains: query, mode: 'insensitive' } },
        { userId: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const [audits, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: audits.map((audit) => this.mapAuditLogToTrail(audit)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Cleanup old audit logs (data retention policy)
   */
  async cleanupOldAudits(retentionDays = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Archive to cold storage if needed, then delete
    const result = await this.prisma.auditLog.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
      },
    });

    return result.count;
  }

  /**
   * Maps Prisma AuditLog to AuditTrail type
   */
  private mapAuditLogToTrail(auditLog: any): AuditTrail {
    return {
      id: auditLog.id,
      entityId: auditLog.entityId,
      entityType: auditLog.entityType,
      action: auditLog.action,
      userId: auditLog.userId,
      userEmail: auditLog.userEmail,
      changes: auditLog.changes || undefined,
      oldValues: auditLog.oldValues ? JSON.parse(auditLog.oldValues) : undefined,
      newValues: auditLog.newValues ? JSON.parse(auditLog.newValues) : undefined,
      metadata: auditLog.metadata ? JSON.parse(auditLog.metadata) : undefined,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      sessionId: auditLog.sessionId,
      deviceId: auditLog.deviceId,
      timestamp: auditLog.timestamp,
      createdAt: auditLog.createdAt,
    };
  }
}
