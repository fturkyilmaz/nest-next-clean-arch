# Soft Delete & Audit Logging - Implementation Example

Complete implementation example showing soft delete and audit logging in action.

## Example 1: Diet Plan Service with Soft Delete

```typescript
// diet-plan.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@diet/infrastructure';
import { SoftDeleteService } from '@diet/infrastructure';
import { AuditService } from '@diet/infrastructure';
import { AuditEntityType, AuditAction } from '@diet/shared';
import { CreateDietPlanDto, UpdateDietPlanDto } from './diet-plan.dto';

@Injectable()
export class DietPlanService {
  constructor(
    private prisma: PrismaService,
    private softDeleteService: SoftDeleteService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateDietPlanDto, userId: string) {
    const dietPlan = await this.prisma.dietPlan.create({
      data: {
        ...dto,
        userId,
      },
    });

    // Audit logged via @Audit decorator in controller
    return dietPlan;
  }

  async update(id: string, dto: UpdateDietPlanDto, userId: string) {
    // Get old values for audit
    const oldPlan = await this.prisma.dietPlan.findUnique({
      where: { id },
    });

    if (!oldPlan) throw new Error('Diet plan not found');

    const updatedPlan = await this.prisma.dietPlan.update({
      where: { id },
      data: dto,
    });

    // Audit automatically logged via interceptor
    return updatedPlan;
  }

  async delete(id: string, reason: string) {
    await this.softDeleteService.softDelete(
      this.prisma.dietPlan,
      id,
      AuditEntityType.DIET_PLAN,
      {
        reason,
        cascade: true, // Delete related meals
        tags: ['user-initiated'],
      },
    );
  }

  async restore(id: string) {
    await this.softDeleteService.restore(
      this.prisma.dietPlan,
      id,
      AuditEntityType.DIET_PLAN,
      {
        reason: 'User restoration request',
        restoreRelated: true,
      },
    );
  }

  async getById(id: string) {
    // Automatically excludes deleted records
    return this.prisma.dietPlan.findUnique({
      where: { id, deletedAt: null },
      include: {
        meals: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async getByIdIncludingDeleted(id: string) {
    // Explicitly include deleted records
    return this.prisma.dietPlan.findUnique({
      where: { id },
      paranoid: false,
    });
  }

  async listUserPlans(userId: string) {
    return this.prisma.dietPlan.findMany({
      where: {
        userId,
        deletedAt: null, // Only active plans
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDeletedPlans(userId: string) {
    return this.prisma.dietPlan.findMany({
      where: {
        userId,
        deletedAt: { not: null }, // Only deleted plans
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  async getAuditHistory(id: string) {
    return this.auditService.getEntityHistory(
      AuditEntityType.DIET_PLAN,
      id,
      100,
    );
  }

  async getAuditSummary(id: string) {
    return this.auditService.getEntitySummary(
      AuditEntityType.DIET_PLAN,
      id,
    );
  }
}
```

## Example 2: Controller with Decorators

```typescript
// diet-plan.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import {
  Audit,
  AuditInterceptor,
  SoftDeleteable,
  IncludeDeleted,
} from '@diet/infrastructure';
import { AuditEntityType, AuditAction, AuthUser } from '@diet/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { DietPlanService } from './diet-plan.service';
import { CreateDietPlanDto, UpdateDietPlanDto } from './diet-plan.dto';
import { User } from '@prisma/client';

@Controller('api/diet-plans')
@UseInterceptors(AuditInterceptor) // Enable audit interceptor
export class DietPlanController {
  constructor(private service: DietPlanService) {}

  @Post()
  @Audit(AuditEntityType.DIET_PLAN, AuditAction.CREATE, {
    captureRequest: true,
    captureResponse: true,
  })
  async createPlan(
    @Body() dto: CreateDietPlanDto,
    @CurrentUser() user: User,
  ) {
    return this.service.create(dto, user.id);
  }

  @Get(':id')
  async getPlan(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Get(':id/with-deleted')
  @IncludeDeleted() // Include soft-deleted record
  async getPlanWithDeleted(@Param('id') id: string) {
    return this.service.getByIdIncludingDeleted(id);
  }

  @Patch(':id')
  @Audit(AuditEntityType.DIET_PLAN, AuditAction.UPDATE)
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateDietPlanDto,
    @CurrentUser() user: User,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @Audit(AuditEntityType.DIET_PLAN, AuditAction.DELETE)
  async deletePlan(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: User,
  ) {
    await this.service.delete(id, reason || 'User deletion');
    return { success: true };
  }

  @Post(':id/restore')
  @Audit(AuditEntityType.DIET_PLAN, AuditAction.RESTORE)
  async restorePlan(@Param('id') id: string) {
    await this.service.restore(id);
    return { success: true };
  }

  @Get()
  async listPlans(@CurrentUser() user: User) {
    return this.service.listUserPlans(user.id);
  }

  @Get('/deleted')
  async getDeletedPlans(@CurrentUser() user: User) {
    return this.service.getDeletedPlans(user.id);
  }

  @Get(':id/audit-history')
  async getAuditHistory(@Param('id') id: string) {
    return this.service.getAuditHistory(id);
  }

  @Get(':id/audit-summary')
  async getAuditSummary(@Param('id') id: string) {
    return this.service.getAuditSummary(id);
  }
}
```

## Example 3: Audit Controller

```typescript
// audit.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from '@diet/infrastructure';
import { JwtAuthGuard, AdminGuard } from '@diet/infrastructure';
import {
  AuditEntityType,
  AuditAction,
  auditQuerySchema,
  AuditQueryResult,
} from '@diet/shared';

@Controller('api/audit')
@UseGuards(JwtAuthGuard, AdminGuard) // Restrict to admins
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  async getAuditLogs(
    @Query('entityId') entityId?: string,
    @Query('entityType') entityType?: AuditEntityType,
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<AuditQueryResult> {
    const query = auditQuerySchema.parse({
      entityId,
      entityType,
      userId,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: parseInt(String(page)),
      limit: Math.min(parseInt(String(limit)), 100),
    });

    return this.auditService.queryAudits(query);
  }

  @Get('history/:entityType/:entityId')
  async getEntityHistory(
    @Query('entityType') entityType: AuditEntityType,
    @Query('entityId') entityId: string,
  ) {
    return this.auditService.getEntityHistory(entityType, entityId, 100);
  }

  @Get('user-activity/:userId')
  async getUserActivity(
    @Query('userId') userId: string,
    @Query('days') days = 30,
  ) {
    return this.auditService.getUserActivity(userId, days);
  }

  @Get('entity-summary/:entityType/:entityId')
  async getEntitySummary(
    @Query('entityType') entityType: AuditEntityType,
    @Query('entityId') entityId: string,
  ) {
    return this.auditService.getEntitySummary(entityType, entityId);
  }

  @Get('search')
  async searchAudits(
    @Query('query') query: string,
    @Query('entityType') entityType?: AuditEntityType,
    @Query('action') action?: AuditAction,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.auditService.searchAudits(
      query,
      { entityType, action },
      page,
      limit,
    );
  }

  @Get('compliance-report')
  async getComplianceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.auditService.generateComplianceReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('high-risk-events')
  async getHighRiskEvents(
    @Query('days') days = 7,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.auditService.queryAudits({
      startDate,
      limit: 1000,
    });

    const highRiskEvents = result.data.filter(
      (audit) => audit.metadata?.riskLevel === 'HIGH',
    );

    return {
      count: highRiskEvents.length,
      events: highRiskEvents,
      period: { startDate, endDate: new Date() },
    };
  }
}
```

## Example 4: Scheduled Tasks for Maintenance

```typescript
// audit-maintenance.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditService } from '@diet/infrastructure';
import { SoftDeleteService } from '@diet/infrastructure';
import { PrismaService } from '@diet/infrastructure';
import { AuditEntityType } from '@diet/shared';

@Injectable()
export class AuditMaintenanceService {
  constructor(
    private auditService: AuditService,
    private softDeleteService: SoftDeleteService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldAuditLogs(): Promise<void> {
    try {
      // Delete audit logs older than 90 days
      const deleted = await this.auditService.cleanupOldAudits(90);
      console.log(`[Audit Cleanup] Deleted ${deleted} old audit logs`);
    } catch (error) {
      console.error('[Audit Cleanup] Error:', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async purgeOldDeletedRecords(): Promise<void> {
    try {
      // Hard-delete soft-deleted records older than 30 days
      const entities = [
        { model: this.prisma.dietPlan, type: AuditEntityType.DIET_PLAN },
        { model: this.prisma.meal, type: AuditEntityType.MEAL },
        { model: this.prisma.nutritionLog, type: AuditEntityType.NUTRITION_LOG },
      ];

      for (const { model, type } of entities) {
        const purged = await this.softDeleteService.purgeOldDeleted(
          model,
          type,
          30,
        );
        console.log(
          `[Soft Delete Purge] Purged ${purged} old deleted ${type} records`,
        );
      }
    } catch (error) {
      console.error('[Soft Delete Purge] Error:', error);
    }
  }

  @Cron(CronExpression.EVERY_MONDAY_AT_9AM)
  async generateWeeklyComplianceReport(): Promise<void> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const report = await this.auditService.generateComplianceReport(
        startDate,
        endDate,
      );

      // Store or send report
      console.log('[Compliance Report] Generated:', {
        period: { startDate, endDate },
        totalActions: report.totalActions,
        highRiskEvents: report.riskEvents.length,
      });

      // Send to compliance team via email/Slack
      // await this.notificationService.sendComplianceReport(report);
    } catch (error) {
      console.error('[Compliance Report] Error:', error);
    }
  }
}
```

## Example 5: Frontend Integration

```typescript
// hooks/useAudit.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AuditTrail, AuditEntityType } from '@diet/shared';

export function useAuditHistory(
  entityType: AuditEntityType,
  entityId: string,
) {
  return useQuery({
    queryKey: ['audit-history', entityType, entityId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/audit/history/${entityType}/${entityId}`,
      );
      return res.data as AuditTrail[];
    },
  });
}

export function useAuditSummary(
  entityType: AuditEntityType,
  entityId: string,
) {
  return useQuery({
    queryKey: ['audit-summary', entityType, entityId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/audit/entity-summary/${entityType}/${entityId}`,
      );
      return res.data;
    },
  });
}

export function useSoftDelete(
  entityType: AuditEntityType,
  entityId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reason: string) => {
      await apiClient.delete(`/api/${entityType}/${entityId}`, {
        data: { reason },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [entityType.toLowerCase()],
      });
      queryClient.invalidateQueries({
        queryKey: ['audit-history'],
      });
    },
  });
}

export function useRestoreEntity(
  entityType: AuditEntityType,
  entityId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/api/${entityType}/${entityId}/restore`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [entityType.toLowerCase()],
      });
      queryClient.invalidateQueries({
        queryKey: ['audit-history'],
      });
    },
  });
}
```

## Example 6: Audit Trail Display Component

```typescript
// components/AuditTrailTimeline.tsx
import { AuditTrail, AuditAction } from '@diet/shared';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface Props {
  audits: AuditTrail[];
  loading?: boolean;
}

export function AuditTrailTimeline({ audits, loading }: Props) {
  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return '✚';
      case AuditAction.UPDATE:
        return '✎';
      case AuditAction.DELETE:
        return '✕';
      case AuditAction.RESTORE:
        return '↻';
      default:
        return '•';
    }
  };

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return 'text-green-600';
      case AuditAction.UPDATE:
        return 'text-blue-600';
      case AuditAction.DELETE:
        return 'text-red-600';
      case AuditAction.RESTORE:
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading audit history...</div>;
  }

  if (audits.length === 0) {
    return <div className="text-center py-4 text-gray-500">No changes yet</div>;
  }

  return (
    <div className="space-y-2">
      {audits.map((audit) => (
        <div
          key={audit.id}
          className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div className={clsx('text-lg font-bold', getActionColor(audit.action))}>
            {getActionIcon(audit.action)}
          </div>

          <div className="flex-1">
            <div className="font-medium">
              {audit.action} by {audit.userEmail || audit.userId}
            </div>

            <div className="text-sm text-gray-600">
              {formatDistanceToNow(new Date(audit.timestamp), {
                addSuffix: true,
              })}
            </div>

            {audit.changes && audit.changes.length > 0 && (
              <div className="mt-2 space-y-1 text-sm">
                {audit.changes.map((change, idx) => (
                  <div
                    key={idx}
                    className="text-gray-700 pl-4 border-l-2 border-gray-300"
                  >
                    <strong>{change.field}</strong>:{' '}
                    <span className="line-through text-red-600">
                      {String(change.oldValue)}
                    </span>
                    {' → '}
                    <span className="text-green-600">{String(change.newValue)}</span>
                  </div>
                ))}
              </div>
            )}

            {audit.metadata?.reason && (
              <div className="mt-2 italic text-gray-600">
                Reason: {audit.metadata.reason}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Testing Soft Delete & Audit

```typescript
// soft-delete.service.spec.ts
import { Test } from '@nestjs/testing';
import { SoftDeleteService } from './soft-delete.service';
import { AuditService } from './audit.service';
import { PrismaService } from '../database/prisma.service';

describe('SoftDeleteService', () => {
  let service: SoftDeleteService;
  let prisma: PrismaService;
  let auditService: AuditService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SoftDeleteService, AuditService, PrismaService],
    }).compile();

    service = module.get(SoftDeleteService);
    prisma = module.get(PrismaService);
    auditService = module.get(AuditService);
  });

  it('should soft delete an entity', async () => {
    const dietPlan = await prisma.dietPlan.create({
      data: {
        userId: 'test-user',
        name: 'Test Plan',
      },
    });

    await service.softDelete(
      prisma.dietPlan,
      dietPlan.id,
      AuditEntityType.DIET_PLAN,
      { reason: 'Test deletion' },
    );

    const deleted = await prisma.dietPlan.findUnique({
      where: { id: dietPlan.id },
      paranoid: false,
    });

    expect(deleted.deletedAt).not.toBeNull();
  });

  it('should restore a soft-deleted entity', async () => {
    const dietPlan = await prisma.dietPlan.create({
      data: {
        userId: 'test-user',
        name: 'Test Plan',
        deletedAt: new Date(),
      },
    });

    await service.restore(
      prisma.dietPlan,
      dietPlan.id,
      AuditEntityType.DIET_PLAN,
    );

    const restored = await prisma.dietPlan.findUnique({
      where: { id: dietPlan.id },
    });

    expect(restored.deletedAt).toBeNull();
  });

  it('should create audit log for soft delete', async () => {
    const dietPlan = await prisma.dietPlan.create({
      data: {
        userId: 'test-user',
        name: 'Test Plan',
      },
    });

    await service.softDelete(
      prisma.dietPlan,
      dietPlan.id,
      AuditEntityType.DIET_PLAN,
    );

    const auditLog = await prisma.auditLog.findFirst({
      where: { entityId: dietPlan.id },
    });

    expect(auditLog).not.toBeNull();
    expect(auditLog.action).toBe(AuditAction.DELETE);
  });
});
```

These examples show the complete soft delete and audit logging system in action across your NestJS backend, React web frontend, and React Native mobile app.
