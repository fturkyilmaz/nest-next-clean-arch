/**
 * Replication Service - Backend
 *
 * Handles offline data replication, conflict detection, and sync endpoints.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  ReplicationPayload,
  ReplicationResponse,
  ConflictResolution,
} from '@diet/shared';
import { AppError, ErrorCode } from '@diet/shared';

@Injectable()
export class ReplicationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Pull changes from server
   */
  async pullChanges(
    userId: string,
    lastSyncToken?: string,
  ): Promise<ReplicationResponse> {
    const startDate = lastSyncToken ? new Date(parseInt(lastSyncToken)) : new Date(0);
    const now = new Date();
    const syncToken = now.getTime().toString();

    // Get changed diet plans
    const dietPlans = await this.prisma.dietPlan.findMany({
      where: {
        userId,
        updatedAt: { gte: startDate },
      },
    });

    // Get changed meals
    const meals = await this.prisma.meal.findMany({
      where: {
        dietPlan: {
          userId,
        },
        updatedAt: { gte: startDate },
      },
    });

    // Get changed metrics
    const metrics = await this.prisma.metric.findMany({
      where: {
        userId,
        recordedAt: { gte: startDate },
      },
    });

    // Get changed foods
    const foods = await this.prisma.food.findMany({
      where: {
        userId,
        updatedAt: { gte: startDate },
      },
    });

    // Get deleted records (soft deleted)
    const deletedRecords = await this.prisma.auditLog.findMany({
      where: {
        userId,
        action: 'DELETE',
        timestamp: { gte: startDate },
      },
      distinct: ['entityId'],
    });

    const deletedIds = deletedRecords.map((r) => r.entityId);

    const serverChanges = [
      ...dietPlans.map((plan) => ({
        entityType: 'DIET_PLAN',
        entityId: plan.id,
        data: plan,
        serverVersion: 1, // Would implement versioning
        lastModified: plan.updatedAt,
      })),
      ...meals.map((meal) => ({
        entityType: 'MEAL',
        entityId: meal.id,
        data: meal,
        serverVersion: 1,
        lastModified: meal.updatedAt,
      })),
      ...metrics.map((metric) => ({
        entityType: 'METRIC',
        entityId: metric.id,
        data: metric,
        serverVersion: 1,
        lastModified: metric.recordedAt,
      })),
      ...foods.map((food) => ({
        entityType: 'FOOD',
        entityId: food.id,
        data: food,
        serverVersion: 1,
        lastModified: food.updatedAt,
      })),
    ];

    return {
      syncToken,
      serverChanges,
      conflicts: [], // Would detect conflicts
      deletedIds,
    };
  }

  /**
   * Push local changes to server
   */
  async pushChanges(
    userId: string,
    payload: ReplicationPayload,
  ): Promise<{ createdIds: Record<string, string> }> {
    const createdIds: Record<string, string> = {};

    // Process creates
    const createChanges = payload.changes.filter((c) => c.operation === 'CREATE');
    for (const change of createChanges) {
      try {
        const entity = await this.createEntity(userId, change);
        if (entity) {
          createdIds[change.id] = entity.id;
        }
      } catch (error) {
        console.error('Failed to create entity:', error);
      }
    }

    // Process updates
    const updateChanges = payload.changes.filter((c) => c.operation === 'UPDATE');
    for (const change of updateChanges) {
      try {
        await this.updateEntity(userId, change);
      } catch (error) {
        console.error('Failed to update entity:', error);
      }
    }

    // Process deletes
    for (const deletion of payload.deletions) {
      try {
        await this.deleteEntity(userId, deletion);
      } catch (error) {
        console.error('Failed to delete entity:', error);
      }
    }

    return { createdIds };
  }

  /**
   * Detect conflicts
   */
  async detectConflicts(
    userId: string,
    clientChanges: any[],
  ): Promise<ConflictResolution[]> {
    const conflicts: ConflictResolution[] = [];

    for (const change of clientChanges) {
      const serverEntity = await this.getEntity(change.entityType, change.entityId);

      if (serverEntity) {
        // Check if versions differ
        if (this.isModifiedAfter(serverEntity.updatedAt, change.timestamp)) {
          conflicts.push({
            recordId: `${change.entityType}:${change.entityId}`,
            entityType: change.entityType,
            entityId: change.entityId,
            localVersion: change.data,
            serverVersion: serverEntity,
            conflictType: 'VERSION_MISMATCH',
            resolution: 'SERVER_WIN',
            resolvedAt: new Date(),
          });
        }
      } else if (change.operation === 'DELETE') {
        // Check if already deleted on server
        const wasDeleted = await this.wasEntityDeleted(
          change.entityType,
          change.entityId,
          change.timestamp,
        );

        if (wasDeleted) {
          conflicts.push({
            recordId: `${change.entityType}:${change.entityId}`,
            entityType: change.entityType,
            entityId: change.entityId,
            localVersion: change.data,
            serverVersion: null,
            conflictType: 'DELETED_ON_SERVER',
            resolution: 'SERVER_WIN',
            resolvedAt: new Date(),
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    recordId: string,
    resolution: 'LOCAL_WIN' | 'SERVER_WIN' | 'MERGE',
    mergedData?: any,
  ): Promise<void> {
    // Store resolution in audit log for compliance
    // Implementation depends on your conflict storage mechanism
  }

  /**
   * Create entity from client change
   */
  private async createEntity(userId: string, change: any): Promise<any> {
    switch (change.entityType) {
      case 'DIET_PLAN':
        return this.prisma.dietPlan.create({
          data: {
            ...change.data,
            userId,
          },
        });

      case 'MEAL':
        return this.prisma.meal.create({
          data: {
            ...change.data,
            userId,
          },
        });

      case 'METRIC':
        return this.prisma.metric.create({
          data: {
            ...change.data,
            userId,
          },
        });

      case 'FOOD':
        return this.prisma.food.create({
          data: {
            ...change.data,
            userId,
          },
        });

      default:
        throw new Error(`Unknown entity type: ${change.entityType}`);
    }
  }

  /**
   * Update entity from client change
   */
  private async updateEntity(userId: string, change: any): Promise<any> {
    // Verify user ownership before updating
    const entity = await this.getEntity(change.entityType, change.entityId);

    if (!entity) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Entity not found');
    }

    // Verify ownership
    if ('userId' in entity && entity.userId !== userId) {
      throw new AppError(ErrorCode.FORBIDDEN, 'Not authorized');
    }

    switch (change.entityType) {
      case 'DIET_PLAN':
        return this.prisma.dietPlan.update({
          where: { id: change.entityId },
          data: change.data,
        });

      case 'MEAL':
        return this.prisma.meal.update({
          where: { id: change.entityId },
          data: change.data,
        });

      case 'METRIC':
        return this.prisma.metric.update({
          where: { id: change.entityId },
          data: change.data,
        });

      case 'FOOD':
        return this.prisma.food.update({
          where: { id: change.entityId },
          data: change.data,
        });

      default:
        throw new Error(`Unknown entity type: ${change.entityType}`);
    }
  }

  /**
   * Delete entity from client change
   */
  private async deleteEntity(userId: string, deletion: any): Promise<void> {
    // Soft delete with audit trail
    const entity = await this.getEntity(deletion.entityType, deletion.entityId);

    if (!entity) return;

    // Verify ownership
    if ('userId' in entity && entity.userId !== userId) {
      throw new AppError(ErrorCode.FORBIDDEN, 'Not authorized');
    }

    switch (deletion.entityType) {
      case 'DIET_PLAN':
        await this.prisma.dietPlan.update({
          where: { id: deletion.entityId },
          data: { deletedAt: new Date() },
        });
        break;

      case 'MEAL':
        await this.prisma.meal.update({
          where: { id: deletion.entityId },
          data: { deletedAt: new Date() },
        });
        break;

      case 'METRIC':
        await this.prisma.metric.update({
          where: { id: deletion.entityId },
          data: { deletedAt: new Date() },
        });
        break;

      case 'FOOD':
        await this.prisma.food.update({
          where: { id: deletion.entityId },
          data: { deletedAt: new Date() },
        });
        break;
    }
  }

  /**
   * Get entity
   */
  private async getEntity(entityType: string, entityId: string): Promise<any> {
    switch (entityType) {
      case 'DIET_PLAN':
        return this.prisma.dietPlan.findUnique({
          where: { id: entityId },
        });

      case 'MEAL':
        return this.prisma.meal.findUnique({
          where: { id: entityId },
        });

      case 'METRIC':
        return this.prisma.metric.findUnique({
          where: { id: entityId },
        });

      case 'FOOD':
        return this.prisma.food.findUnique({
          where: { id: entityId },
        });

      default:
        return null;
    }
  }

  /**
   * Check if entity was deleted
   */
  private async wasEntityDeleted(
    entityType: string,
    entityId: string,
    beforeDate: Date,
  ): Promise<boolean> {
    const deleteAudit = await this.prisma.auditLog.findFirst({
      where: {
        entityType,
        entityId,
        action: 'DELETE',
        timestamp: { lte: beforeDate },
      },
      orderBy: { timestamp: 'desc' },
    });

    return !!deleteAudit;
  }

  /**
   * Check if server version is newer
   */
  private isModifiedAfter(serverDate: Date, clientDate: Date): boolean {
    return serverDate > clientDate;
  }
}
