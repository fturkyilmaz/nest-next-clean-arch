import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';

@Injectable()
export class PrismaReportRepository {
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
