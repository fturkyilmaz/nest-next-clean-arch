# Soft Delete & Audit Logging Guide

## Overview

This guide covers the comprehensive soft delete and audit logging system that ensures data compliance, enables data recovery, and provides complete change tracking across the diet-plan-ai platform.

## Core Concepts

### Soft Delete
**Soft delete** marks records as deleted (via `deletedAt` timestamp) without removing them from the database. This enables:
- Data recovery and restoration
- Compliance with data retention policies
- Change history preservation
- Cascade deletion management

### Audit Trail
**Audit trails** record every change to entities including:
- Who made the change (user ID, email)
- What changed (field name, old value, new value)
- When it happened (timestamp)
- Why it happened (reason metadata)
- Where it came from (IP, device, session)

### Risk Levels
Each audit action is assigned a risk level:
- **LOW**: Read operations, non-critical updates
- **MEDIUM**: Updates to sensitive entities, approvals, shares
- **HIGH**: Deletions, bulk operations, critical entity changes

## Database Schema

Add soft delete fields to your Prisma schema:

```prisma
model DietPlan {
  id              String    @id @default(cuid())
  userId          String
  name            String
  description     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime? // Soft delete timestamp
  deletedReason   String?   // Why it was deleted
  deletedTags     String[]  @default([])
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  meals           Meal[]
  
  @@index([userId])
  @@index([deletedAt]) // Important for soft delete queries
}

model AuditLog {
  id              String    @id @default(cuid())
  entityType      String    // DIET_PLAN, MEAL, etc.
  entityId        String
  action          String    // CREATE, UPDATE, DELETE, etc.
  userId          String
  userEmail       String?
  changes         Json?     // Array of { field, oldValue, newValue }
  oldValues       String?   // JSON string
  newValues       String?   // JSON string
  metadata        String    // JSON with source, reason, riskLevel
  ipAddress       String?
  userAgent       String?
  sessionId       String?
  deviceId        String?
  timestamp       DateTime  @default(now())
  createdAt       DateTime  @default(now())
  
  @@index([entityId, entityType])
  @@index([userId])
  @@index([timestamp])
  @@index([action])
}
```

## Usage Patterns

### Basic Soft Delete

```typescript
import { SoftDeleteService } from '@diet/infrastructure';
import { AuditEntityType } from '@diet/shared';

@Injectable()
export class DietPlanService {
  constructor(private softDeleteService: SoftDeleteService) {}

  async deletePlan(planId: string, reason: string): Promise<void> {
    await this.softDeleteService.softDelete(
      this.prisma.dietPlan,
      planId,
      AuditEntityType.DIET_PLAN,
      {
        reason,
        tags: ['user-initiated'],
      },
    );
  }
}
```

### Restore a Deleted Entity

```typescript
async restorePlan(planId: string): Promise<void> {
  await this.softDeleteService.restore(
    this.prisma.dietPlan,
    planId,
    AuditEntityType.DIET_PLAN,
    {
      reason: 'Restored by user request',
      restoreRelated: true, // Also restore cascade-deleted meals
    },
  );
}
```

### Cascade Delete

Delete related entities automatically:

```typescript
// When deleting a DietPlan, automatically delete its Meals
async deletePlanWithMeals(planId: string): Promise<void> {
  await this.softDeleteService.softDelete(
    this.prisma.dietPlan,
    planId,
    AuditEntityType.DIET_PLAN,
    {
      cascade: true, // Delete related meals
      reason: 'Plan deleted with cascade',
    },
  );
}
```

### Hard Delete (Permanent)

For GDPR compliance and data purging:

```typescript
// Permanent deletion (cannot be restored)
async permanentlyDeletePlan(planId: string): Promise<void> {
  await this.softDeleteService.softDelete(
    this.prisma.dietPlan,
    planId,
    AuditEntityType.DIET_PLAN,
    {
      hardDelete: true, // Permanent deletion
      reason: 'GDPR data subject request',
    },
  );
}
```

### Automatic Audit Logging

Use decorators for automatic audit logging in controllers:

```typescript
import { Audit, SoftDeleteable } from '@diet/infrastructure';
import { AuditAction, AuditEntityType } from '@diet/shared';

@Controller('diet-plans')
export class DietPlanController {
  @Post()
  @Audit(AuditEntityType.DIET_PLAN, AuditAction.CREATE)
  async createPlan(@Body() dto: CreateDietPlanDto): Promise<DietPlanDto> {
    // Automatically logged
    return this.service.create(dto);
  }

  @Patch(':id')
  @Audit(AuditEntityType.DIET_PLAN, AuditAction.UPDATE)
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateDietPlanDto,
  ): Promise<DietPlanDto> {
    // Changes automatically logged
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Audit(AuditEntityType.DIET_PLAN, AuditAction.DELETE)
  @SoftDeleteable(AuditEntityType.DIET_PLAN)
  async deletePlan(@Param('id') id: string): Promise<void> {
    // Soft delete logged
    await this.service.delete(id);
  }
}
```

### Query Soft-Deleted Records

```typescript
import { SoftDeleteScope } from '@diet/infrastructure';

// Exclude deleted records (default)
const activePlans = await this.prisma.dietPlan.findMany({
  where: { deletedAt: null },
});

// Include deleted records
const allPlans = await this.prisma.dietPlan.findMany({
  ...SoftDeleteScope.includeDeleted(),
});

// Only deleted records
const deletedPlans = await this.prisma.dietPlan.findMany({
  ...SoftDeleteScope.onlyDeleted(),
});

// Check if deleted
const isDeleted = await this.softDeleteService.isDeleted(
  this.prisma.dietPlan,
  planId,
);

// Get deletion info
const deletionInfo = SoftDeleteScope.getDeletionInfo(entity);
```

## Audit Service API

### Query Audit Trails

```typescript
import { AuditService } from '@diet/infrastructure';
import { AuditEntityType, AuditAction } from '@diet/shared';

@Injectable()
export class AuditController {
  constructor(private auditService: AuditService) {}

  // Get all audit logs with filters
  async getAuditLogs(
    entityType?: AuditEntityType,
    userId?: string,
    action?: AuditAction,
    page = 1,
    limit = 20,
  ): Promise<AuditQueryResult> {
    return this.auditService.queryAudits({
      entityType,
      userId,
      action,
      page,
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
  }

  // Get history for specific entity
  async getEntityHistory(entityType: AuditEntityType, entityId: string): Promise<AuditTrail[]> {
    return this.auditService.getEntityHistory(entityType, entityId, 100);
  }

  // Get user activity
  async getUserActivity(userId: string, days = 30): Promise<AuditTrail[]> {
    return this.auditService.getUserActivity(userId, days);
  }

  // Get entity summary
  async getEntitySummary(
    entityType: AuditEntityType,
    entityId: string,
  ): Promise<AuditSummary> {
    return this.auditService.getEntitySummary(entityType, entityId);
  }

  // Search audits
  async searchAudits(query: string): Promise<AuditQueryResult> {
    return this.auditService.searchAudits(query, {}, 1, 20);
  }

  // Generate compliance report
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
  ): Promise<ComplianceReport> {
    return this.auditService.generateComplianceReport(startDate, endDate);
  }
}
```

## Compliance & Retention Policies

### Data Retention
By default, audit logs are retained for **90 days**. Older records are deleted automatically.

```typescript
// Cleanup old audit logs (run as scheduled task)
async cleanupAudits(): Promise<void> {
  const deletedCount = await this.auditService.cleanupOldAudits(90);
  console.log(`Cleaned up ${deletedCount} old audit logs`);
}

// Purge old soft-deleted records
async purgeOldDeletedRecords(): Promise<void> {
  const purgedCount = await this.softDeleteService.purgeOldDeleted(
    this.prisma.dietPlan,
    AuditEntityType.DIET_PLAN,
    30, // 30 days
  );
  console.log(`Purged ${purgedCount} old deleted records`);
}
```

### GDPR Compliance

```typescript
// Right to be forgotten - hard delete all user data
async deleteUserCompletely(userId: string): Promise<void> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error('User not found');

  // Delete all related data with cascade
  await this.softDeleteService.softDelete(
    this.prisma.user,
    userId,
    AuditEntityType.USER,
    {
      hardDelete: true, // Permanent deletion
      cascade: true,
      reason: 'GDPR Article 17 - Right to be forgotten',
      tags: ['gdpr', 'data-subject-request'],
    },
  );

  // Optionally hard delete audit logs mentioning this user
  // (with additional privacy considerations)
}
```

### Compliance Reports

```typescript
// Generate audit report for compliance
async getComplianceReport(month: number, year: number): Promise<void> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const report = await this.auditService.generateComplianceReport(
    startDate,
    endDate,
  );

  // Report includes:
  // - Total actions
  // - Action summary (CREATE: 100, UPDATE: 50, DELETE: 10)
  // - Entity summary (DIET_PLAN: 80, MEAL: 90)
  // - User summary (user@example.com: 120 actions)
  // - High-risk events (deletions, bulk operations)
  // - Data retention metadata
}
```

## Frontend Integration

### React Example

```typescript
// Hook for querying audit history
function useAuditHistory(
  entityType: AuditEntityType,
  entityId: string,
) {
  return useQuery({
    queryKey: ['audit', entityType, entityId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/audit/history/${entityType}/${entityId}`,
      );
      return res.data as AuditTrail[];
    },
  });
}

// Hook for soft delete with restore
function useSoftDelete(
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
    },
  });
}

// Example component
export function DietPlanCard({ plan }: { plan: DietPlan }) {
  const { mutate: deletePlan } = useSoftDelete(AuditEntityType.DIET_PLAN, plan.id);
  const { data: history } = useAuditHistory(AuditEntityType.DIET_PLAN, plan.id);

  return (
    <div>
      <h3>{plan.name}</h3>

      <button
        onClick={() =>
          deletePlan('User initiated deletion', {
            onSuccess: () => toast.success('Plan deleted'),
          })
        }
      >
        Delete Plan
      </button>

      <AuditTrailTimeline audits={history} />
    </div>
  );
}
```

### React Native Example

```typescript
// Mobile implementation
const useSoftDeleteMobile = (
  entityType: AuditEntityType,
  entityId: string,
) => {
  return useMutation({
    mutationFn: async (reason: string) => {
      const response = await apiClient.delete(
        `/api/${entityType}/${entityId}`,
        { data: { reason } },
      );
      return response.data;
    },
  });
};

// Usage
export function DietPlanScreen({ plan }: { plan: DietPlan }) {
  const { mutate: deletePlan } = useSoftDeleteMobile(
    AuditEntityType.DIET_PLAN,
    plan.id,
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Plan?',
      'This can be restored later',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: () => deletePlan('Mobile app - user deletion'),
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <View>
      <Text>{plan.name}</Text>
      <TouchableOpacity onPress={handleDelete}>
        <Text>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Best Practices

1. **Always Provide a Reason**: Include a reason for deletions and important updates for compliance
2. **Use Tags**: Tag audit logs with categories (e.g., 'user-initiated', 'admin', 'automation')
3. **Regular Audits**: Review high-risk events regularly
4. **Data Retention**: Follow local regulations for data retention (GDPR requires ability to delete)
5. **Sensitive Data**: Redact passwords, tokens, and sensitive fields from audit logs
6. **Cascade Carefully**: Verify cascade relationships before deleting parent entities
7. **Backup Compliance**: Ensure audit logs are backed up separately from operational data
8. **Access Control**: Restrict audit log access to authorized personnel only

## API Reference

See [SOFT_DELETE_API.md](./SOFT_DELETE_API.md) for detailed endpoint documentation.

## Troubleshooting

### Audit logs not recording
- Check that `AuditInterceptor` is registered in the app module
- Verify controllers have the `@Audit` decorator
- Check request context service is properly initialized

### Cascade deletion not working
- Verify Prisma relationships are configured
- Check that cascade handling is enabled in soft delete options
- Review cascade relationships in soft-delete.service.ts

### Soft-deleted records still appearing
- Ensure queries use the soft delete scope: `where: { deletedAt: null }`
- Check that Prisma extensions are loaded
- Verify `paranoid: false` is used when intentionally including deleted records

### Performance issues with audit queries
- Add database indexes on frequently queried fields (userId, entityType, timestamp)
- Regularly cleanup old audit logs
- Consider archiving audit logs to separate storage after retention period
