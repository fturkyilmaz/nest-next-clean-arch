import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';
import { IDietPlanRepository } from '../../application/interfaces/IDietPlanRepository';
import { DietPlan, DietPlanStatus } from '../../domain/entities/DietPlan.entity';
import { DateRange } from '../../domain/value-objects/DateRange.vo';

@Injectable()
export class PrismaDietPlanRepository implements IDietPlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DietPlan | null> {
    const dietPlan = await this.prisma.dietPlan.findUnique({
      where: { id },
    });

    if (!dietPlan) {
      return null;
    }

    return this.toDomain(dietPlan);
  }

  async findByClientId(
    clientId: string,
    filters?: {
      status?: string;
      isActive?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<DietPlan[]> {
    const dietPlans = await this.prisma.dietPlan.findMany({
      where: {
        clientId,
        status: filters?.status as any,
        isActive: filters?.isActive,
        deletedAt: null,
      },
      skip: filters?.skip,
      take: filters?.take,
      orderBy: { createdAt: 'desc' },
    });

    return dietPlans.map((plan) => this.toDomain(plan));
  }

  async findByDietitianId(
    dietitianId: string,
    filters?: {
      status?: string;
      isActive?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<DietPlan[]> {
    const dietPlans = await this.prisma.dietPlan.findMany({
      where: {
        dietitianId,
        status: filters?.status as any,
        isActive: filters?.isActive,
        deletedAt: null,
      },
      skip: filters?.skip,
      take: filters?.take,
      orderBy: { createdAt: 'desc' },
    });

    return dietPlans.map((plan) => this.toDomain(plan));
  }

  async findActiveByClientId(clientId: string): Promise<DietPlan | null> {
    const dietPlan = await this.prisma.dietPlan.findFirst({
      where: {
        clientId,
        status: 'ACTIVE',
        isActive: true,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!dietPlan) {
      return null;
    }

    return this.toDomain(dietPlan);
  }

  async findAll(filters?: {
    clientId?: string;
    dietitianId?: string;
    status?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<DietPlan[]> {
    const dietPlans = await this.prisma.dietPlan.findMany({
      where: {
        clientId: filters?.clientId,
        dietitianId: filters?.dietitianId,
        status: filters?.status as any,
        isActive: filters?.isActive,
        deletedAt: null,
      },
      skip: filters?.skip,
      take: filters?.take,
      orderBy: { createdAt: 'desc' },
    });

    return dietPlans.map((plan) => this.toDomain(plan));
  }

  async count(filters?: {
    clientId?: string;
    dietitianId?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<number> {
    return await this.prisma.dietPlan.count({
      where: {
        clientId: filters?.clientId,
        dietitianId: filters?.dietitianId,
        status: filters?.status as any,
        isActive: filters?.isActive,
        deletedAt: null,
      },
    });
  }

  async create(dietPlan: DietPlan): Promise<DietPlan> {
    const data = this.toPersistence(dietPlan);

    const created = await this.prisma.dietPlan.create({
      data,
    });

    return this.toDomain(created);
  }

  async update(dietPlan: DietPlan): Promise<DietPlan> {
    const data = this.toPersistence(dietPlan);

    const updated = await this.prisma.dietPlan.update({
      where: { id: dietPlan.getId() },
      data,
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.dietPlan.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  // Mapper methods
  private toDomain(raw: any): DietPlan {
    const dateRange = DateRange.create(raw.startDate, raw.endDate);
    const nutritionalGoals = {
      targetCalories: raw.targetCalories,
      targetProtein: raw.targetProtein,
      targetCarbs: raw.targetCarbs,
      targetFat: raw.targetFat,
      targetFiber: raw.targetFiber,
    };

    return DietPlan.reconstitute({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      clientId: raw.clientId,
      dietitianId: raw.dietitianId,
      dateRange,
      status: raw.status as DietPlanStatus,
      nutritionalGoals,
      version: raw.version,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  private toPersistence(dietPlan: DietPlan): any {
    const goals = dietPlan.getNutritionalGoals();

    return {
      id: dietPlan.getId() || undefined,
      name: dietPlan.getName(),
      description: dietPlan.getDescription(),
      clientId: dietPlan.getClientId(),
      dietitianId: dietPlan.getDietitianId(),
      startDate: dietPlan.getDateRange().getStartDate(),
      endDate: dietPlan.getDateRange().getEndDate(),
      status: dietPlan.getStatus(),
      targetCalories: goals.targetCalories,
      targetProtein: goals.targetProtein,
      targetCarbs: goals.targetCarbs,
      targetFat: goals.targetFat,
      targetFiber: goals.targetFiber,
      version: dietPlan.getVersion(),
      isActive: dietPlan.isActive(),
      updatedAt: dietPlan.getUpdatedAt(),
      deletedAt: dietPlan.getDeletedAt(),
    };
  }
}
