import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';
import { PrismaRepositoryBase } from './PrismaRepositoryBase';
import { DietPlan } from '@domain/entities/DietPlan.entity';
import { DateRange } from '@domain/value-objects/DateRange.vo';

/**
 * DietPlan Repository using Generic Base
 */
@Injectable()
export class PrismaDietPlanRepository extends PrismaRepositoryBase<any, DietPlan, string> {
  constructor(prisma: PrismaService) {
    super(prisma, 'dietPlan');
  }

  protected toDomain(model: any): DietPlan {
    return DietPlan.reconstitute({
      id: model.id,
      clientId: model.clientId,
      dietitianId: model.dietitianId,
      name: model.name,
      description: model.description,
      status: model.status,
      dateRange: DateRange.create(model.startDate, model.endDate),
      nutritionalGoals: {
        targetCalories: model.targetCalories,
        targetProtein: model.targetProtein,
        targetCarbs: model.targetCarbs,
        targetFat: model.targetFat,
      },
      version: model.version,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    });
  }

  protected toPrisma(domain: DietPlan): any {
    return {
      id: domain.getId() || undefined,
      clientId: domain.getClientId(),
      dietitianId: domain.getDietitianId(),
      name: domain.getName(),
      description: domain.getDescription(),
      status: domain.getStatus(),
      startDate: domain.getStartDate(),
      endDate: domain.getEndDate(),
      targetCalories: domain.getTargetCalories(),
      targetProtein: domain.getTargetProtein(),
      targetCarbs: domain.getTargetCarbs(),
      targetFat: domain.getTargetFat(),
      version: domain.getVersion(),
      isActive: domain.isActive(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt(),
    };
  }

  // Custom methods
  async findByClient(clientId: string): Promise<DietPlan[]> {
    const models = await this.model.findMany({
      where: { clientId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return models.map((m: any) => this.toDomain(m));
  }

  async findActiveByClient(clientId: string): Promise<DietPlan | null> {
    const model = await this.model.findFirst({
      where: { clientId, status: 'ACTIVE', deletedAt: null },
    });
    return model ? this.toDomain(model) : null;
  }
}
