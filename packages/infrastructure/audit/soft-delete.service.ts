/**
 * Soft Delete Service
 *
 * Implements soft delete pattern with cascade deletion, restore functionality,
 * and permanent hard delete support for compliance.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from './audit.service';
import { AuditAction, AuditEntityType, SoftDeleteOptions, RestoreOptions } from '@diet/shared';
import { AppError, ErrorCode } from '@diet/shared';

@Injectable()
export class SoftDeleteService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Soft delete an entity
   */
  async softDelete<T extends { id: string; deletedAt?: Date | null }>(
    model: any,
    entityId: string,
    entityType: AuditEntityType,
    options: SoftDeleteOptions = {},
  ): Promise<void> {
    const { hardDelete = false, cascade = false, reason, tags } = options;

    if (hardDelete) {
      return this.hardDelete(model, entityId, entityType);
    }

    // Fetch entity before deletion for audit
    const entity = await model.findUnique({
      where: { id: entityId },
    });

    if (!entity) {
      throw new AppError(ErrorCode.NOT_FOUND, `${entityType} not found`);
    }

    // Handle cascade deletion
    if (cascade) {
      await this.cascadeDelete(entityType, entityId);
    }

    // Soft delete the entity
    const updateData: any = {
      deletedAt: new Date(),
    };

    // Add deletion metadata if your schema supports it
    if ('deletedReason' in entity) {
      updateData.deletedReason = reason || 'Deleted by user';
    }
    if ('deletedTags' in entity) {
      updateData.deletedTags = tags || [];
    }

    const updated = await model.update({
      where: { id: entityId },
      data: updateData,
    });

    // Log audit trail
    await this.auditService.logAudit(
      entityType,
      entityId,
      AuditAction.DELETE,
      { ...entity, deletedAt: null },
      { ...updated },
      {
        reason,
        tags,
        riskLevel: 'HIGH',
      },
    );
  }

  /**
   * Restore a soft-deleted entity
   */
  async restore<T extends { id: string; deletedAt?: Date | null }>(
    model: any,
    entityId: string,
    entityType: AuditEntityType,
    options: RestoreOptions = {},
  ): Promise<void> {
    const { restoreRelated = false, reason } = options;

    // Fetch entity before restoration for audit
    const entity = await model.findUnique({
      where: { id: entityId },
      paranoid: false, // Include soft-deleted records
    });

    if (!entity) {
      throw new AppError(ErrorCode.NOT_FOUND, `${entityType} not found (deleted)`);
    }

    if (!entity.deletedAt) {
      throw new AppError(ErrorCode.CONFLICT, `${entityType} is not deleted`);
    }

    // Restore the entity
    const restored = await model.update({
      where: { id: entityId },
      data: { deletedAt: null },
    });

    // Handle cascade restore
    if (restoreRelated) {
      await this.cascadeRestore(entityType, entityId);
    }

    // Log audit trail
    await this.auditService.logAudit(
      entityType,
      entityId,
      AuditAction.RESTORE,
      { ...entity },
      { ...restored },
      {
        reason,
        riskLevel: 'MEDIUM',
      },
    );
  }

  /**
   * Hard delete (permanent) an entity
   */
  async hardDelete(model: any, entityId: string, entityType: AuditEntityType): Promise<void> {
    const entity = await model.findUnique({
      where: { id: entityId },
    });

    if (!entity) {
      throw new AppError(ErrorCode.NOT_FOUND, `${entityType} not found`);
    }

    // Delete related records first (cascade)
    await this.cascadeDelete(entityType, entityId, true);

    // Delete the entity permanently
    await model.delete({
      where: { id: entityId },
    });

    // Log audit trail
    await this.auditService.logAudit(
      entityType,
      entityId,
      AuditAction.DELETE,
      { ...entity },
      null,
      {
        reason: 'Hard delete - permanent',
        riskLevel: 'HIGH',
      },
    );
  }

  /**
   * Check if entity is soft deleted
   */
  async isDeleted(model: any, entityId: string): Promise<boolean> {
    const entity = await model.findFirst({
      where: {
        id: entityId,
        deletedAt: { not: null },
      },
    });

    return !!entity;
  }

  /**
   * Get soft-deleted entity
   */
  async getDeleted<T>(model: any, entityId: string): Promise<T | null> {
    return model.findFirst({
      where: {
        id: entityId,
        deletedAt: { not: null },
      },
    });
  }

  /**
   * Get all deleted entities of a type
   */
  async getDeletedEntities(model: any, entityType: AuditEntityType): Promise<any[]> {
    return model.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    });
  }

  /**
   * Permanently delete all soft-deleted entities older than specified days
   */
  async purgeOldDeleted(model: any, entityType: AuditEntityType, daysOld = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await model.deleteMany({
      where: {
        deletedAt: { lte: cutoffDate },
      },
    });

    return result.count;
  }

  /**
   * Handles cascade soft deletion based on entity type
   */
  private async cascadeDelete(entityType: AuditEntityType, entityId: string, hardDelete = false): Promise<void> {
    const operation = hardDelete ? 'hard delete' : 'soft delete';

    switch (entityType) {
      case AuditEntityType.DIET_PLAN:
        // Delete related meals
        const meals = await this.prisma.meal.findMany({
          where: { dietPlanId: entityId },
        });
        for (const meal of meals) {
          await this.softDelete(this.prisma.meal, meal.id, AuditEntityType.MEAL, { hardDelete });
        }
        break;

      case AuditEntityType.MEAL:
        // Delete related nutrition logs and ingredients
        const nutritionLogs = await this.prisma.nutritionLog.findMany({
          where: { mealId: entityId },
        });
        for (const log of nutritionLogs) {
          await this.softDelete(this.prisma.nutritionLog, log.id, AuditEntityType.NUTRITION_LOG, { hardDelete });
        }
        break;

      case AuditEntityType.RECIPE:
        // Delete related meals using this recipe
        const recipeMeals = await this.prisma.meal.findMany({
          where: { recipeId: entityId },
        });
        for (const meal of recipeMeals) {
          await this.softDelete(this.prisma.meal, meal.id, AuditEntityType.MEAL, { hardDelete });
        }
        break;

      case AuditEntityType.USER:
        // Delete all user-related data (diet plans, sessions, etc.)
        const userDietPlans = await this.prisma.dietPlan.findMany({
          where: { userId: entityId },
        });
        for (const plan of userDietPlans) {
          await this.softDelete(this.prisma.dietPlan, plan.id, AuditEntityType.DIET_PLAN, { hardDelete });
        }

        const appointments = await this.prisma.appointment.findMany({
          where: { userId: entityId },
        });
        for (const appt of appointments) {
          await this.softDelete(this.prisma.appointment, appt.id, AuditEntityType.APPOINTMENT, { hardDelete });
        }
        break;

      // Add more entity type cascades as needed
      default:
        break;
    }
  }

  /**
   * Handles cascade restore
   */
  private async cascadeRestore(entityType: AuditEntityType, entityId: string): Promise<void> {
    switch (entityType) {
      case AuditEntityType.DIET_PLAN:
        // Restore related meals
        const meals = await this.prisma.meal.findMany({
          where: { dietPlanId: entityId, deletedAt: { not: null } },
        });
        for (const meal of meals) {
          await this.restore(this.prisma.meal, meal.id, AuditEntityType.MEAL);
        }
        break;

      case AuditEntityType.MEAL:
        // Restore related nutrition logs
        const logs = await this.prisma.nutritionLog.findMany({
          where: { mealId: entityId, deletedAt: { not: null } },
        });
        for (const log of logs) {
          await this.restore(this.prisma.nutritionLog, log.id, AuditEntityType.NUTRITION_LOG);
        }
        break;

      // Add more entity type cascades as needed
      default:
        break;
    }
  }
}
