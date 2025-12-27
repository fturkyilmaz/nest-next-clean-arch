import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';
import { CacheService } from '@infrastructure/cache/cache.service';
import { IReportRepository } from '@application/interfaces/repositories/IReportRepository';

@Injectable()
export class PrismaReportRepository implements IReportRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /**
   * Find all reports
   */
  async findAll(): Promise<any[]> {
    return this.prisma.report.findMany({
      where: { deletedAt: null },
      include: { user: true, client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find report by ID
   */
  async findById(id: string): Promise<any | null> {
    return this.prisma.report.findUnique({
      where: { id },
      include: { user: true, client: true },
    });
  }

  /**
   * Create report
   */
  async create(data: any): Promise<any> {
    return this.prisma.report.create({
      data: {
        title: data.title,
        type: data.type || 'CUSTOM',
        format: data.format || 'PDF',
        data: data.data,
        createdBy: data.createdBy,
        clientId: data.clientId,
      },
      include: { user: true, client: true },
    });
  }

  /**
   * Update report
   */
  async update(id: string, data: any): Promise<any> {
    return this.prisma.report.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        format: data.format,
        data: data.data,
      },
      include: { user: true, client: true },
    });
  }

  /**
   * Delete report (soft delete)
   */
  async delete(id: string): Promise<any> {
    return this.prisma.report.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * General report: active diet plans count and average target values
   */
  async dietPlanSummary(): Promise<any> {
    const summary = await this.prisma.dietPlan.aggregate({
      where: { isActive: true },
      _count: { id: true },
      _avg: {
        targetCalories: true,
        targetProtein: true,
        targetCarbs: true,
        targetFats: true,
        targetFiber: true,
      },
    });

    return {
      activePlans: summary._count.id,
      avgCalories: summary._avg.targetCalories,
      avgProtein: summary._avg.targetProtein,
      avgCarbs: summary._avg.targetCarbs,
      avgFats: summary._avg.targetFats,
      avgFiber: summary._avg.targetFiber,
    };
  }

  /**
   * Client metrics summary: average weight by latest metrics
   */
  async clientMetricsSummary(): Promise<any[]> {
    const metrics = await this.prisma.clientMetrics.groupBy({
      by: ['clientId'],
      _avg: { weight: true, bmi: true, bodyFat: true },
    });

    return metrics.map(m => ({
      clientId: m.clientId,
      avgWeight: m._avg.weight,
      avgBmi: m._avg.bmi,
      avgBodyFat: m._avg.bodyFat,
    }));
  }

  /**
   * Food category summary: average calories by category
   */
  async foodCategorySummary(): Promise<any[]> {
    const foods = await this.prisma.foodItem.groupBy({
      by: ['category'],
      _avg: { calories: true, protein: true, fats: true },
    });

    return foods.map(f => ({
      category: f.category,
      avgCalories: f._avg.calories,
      avgProtein: f._avg.protein,
      avgFats: f._avg.fats,
    }));
  }
}
