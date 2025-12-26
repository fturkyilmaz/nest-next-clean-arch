import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';
import { CacheService } from '@infrastructure/cache/cache.service';
import { IReportRepository } from '@application/interfaces/repositories/IReportRepository';

@Injectable()
export class PrismaReportRepository implements IReportRepository {
  constructor(private readonly cache: CacheService) {}

  /**
   * Find all reports
   */
  async findAll() {
    return prisma.report.findMany({
      where: { deletedAt: null },
      include: { user: true, client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find report by ID
   */
  async findById(id: string) {
    return prisma.report.findUnique({
      where: { id },
      include: { user: true, client: true },
    });
  }

  /**
   * Create report
   */
  async create(data: any) {
    return prisma.report.create({
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
  async update(id: string, data: any) {
    return prisma.report.update({
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
  async delete(id: string) {
    return prisma.report.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Genel rapor: aktif diyet planlarının sayısı ve ortalama hedef değerleri
   */
  async dietPlanSummary() {
    const summary = await prisma.dietPlan.aggregate({
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
   * Danışan bazlı ölçüm raporu: son ölçümlere göre kilo ortalamaları
   */
  async clientMetricsSummary() {
    const metrics = await prisma.clientMetric.groupBy({
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
   * Besin raporu: kategori bazlı ortalama kalori
   */
  async foodCategorySummary() {
    const foods = await prisma.foodItem.groupBy({
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
