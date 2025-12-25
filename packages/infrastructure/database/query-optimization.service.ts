import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Query Optimization Service
 *
 * Provides optimized database query patterns to prevent N+1 queries,
 * use batch loading, and leverage database aggregations.
 */
@Injectable()
export class QueryOptimizationService {
  private readonly logger = new Logger(QueryOptimizationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Field selection strategies to minimize over-fetching
   */
  static readonly selectFields = {
    userPublic: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    userFull: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
    dietPlanBasic: {
      id: true,
      name: true,
      description: true,
      status: true,
      startDate: true,
      endDate: true,
      userId: true,
      createdAt: true,
    },
    mealBasic: {
      id: true,
      dietPlanId: true,
      name: true,
      scheduledTime: true,
      status: true,
      createdAt: true,
    },
    mealFull: {
      id: true,
      dietPlanId: true,
      name: true,
      description: true,
      scheduledTime: true,
      status: true,
      calories: true,
      protein: true,
      carbs: true,
      fats: true,
      createdAt: true,
      updatedAt: true,
    },
    foodBasic: {
      id: true,
      name: true,
      category: true,
      caloriesPer100g: true,
      proteinPer100g: true,
      carbsPer100g: true,
      fatsPer100g: true,
    },
    metricBasic: {
      id: true,
      userId: true,
      type: true,
      value: true,
      unit: true,
      recordedAt: true,
    },
  };

  /**
   * Batch load diet plans with their meals
   * Prevents N+1 queries when loading multiple diet plans with meals
   */
  async batchLoadDietPlanMeals(dietPlanIds: string[]) {
    const meals = await this.prisma.meal.findMany({
      where: {
        dietPlanId: { in: dietPlanIds },
        deletedAt: null,
      },
      select: QueryOptimizationService.selectFields.mealBasic,
    });

    const mealsByPlanId = new Map<string, any[]>();
    dietPlanIds.forEach((id) => mealsByPlanId.set(id, []));
    meals.forEach((meal) => {
      const planMeals = mealsByPlanId.get(meal.dietPlanId) || [];
      planMeals.push(meal);
      mealsByPlanId.set(meal.dietPlanId, planMeals);
    });

    return mealsByPlanId;
  }

  /**
   * Batch load nutrition logs for multiple meals
   * Prevents N+1 queries when calculating meal nutrition
   */
  async batchLoadMealNutrition(mealIds: string[]) {
    const nutritionLogs = await this.prisma.nutritionLog.findMany({
      where: {
        mealId: { in: mealIds },
        deletedAt: null,
      },
      select: {
        id: true,
        mealId: true,
        foodId: true,
        quantity: true,
        unit: true,
        calories: true,
        protein: true,
        carbs: true,
        fats: true,
      },
    });

    const nutritionByMealId = new Map<string, any[]>();
    mealIds.forEach((id) => nutritionByMealId.set(id, []));
    nutritionLogs.forEach((log) => {
      const mealNutrition = nutritionByMealId.get(log.mealId) || [];
      mealNutrition.push(log);
      nutritionByMealId.set(log.mealId, mealNutrition);
    });

    return nutritionByMealId;
  }

  /**
   * Get diet plans with meals using batch loading
   * Optimized for dashboard queries
   */
  async getDietPlansWithMeals(userId: string, skip: number = 0, take: number = 10) {
    const dietPlans = await this.prisma.dietPlan.findMany({
      where: { userId, deletedAt: null },
      select: {
        ...QueryOptimizationService.selectFields.dietPlanBasic,
        mealsCount: { select: { _count: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    if (dietPlans.length === 0) return [];

    const dietPlanIds = dietPlans.map((p) => p.id);
    const mealsByPlanId = await this.batchLoadDietPlanMeals(dietPlanIds);

    return dietPlans.map((plan) => ({
      ...plan,
      meals: mealsByPlanId.get(plan.id) || [],
    }));
  }

  /**
   * Get user metrics within a date range with type filtering
   * Single optimized query with index support
   */
  async getUserMetricsInRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: string,
  ) {
    return this.prisma.metric.findMany({
      where: {
        userId,
        recordedAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(type && { type }),
        deletedAt: null,
      },
      select: QueryOptimizationService.selectFields.metricBasic,
      orderBy: { recordedAt: 'desc' },
    });
  }

  /**
   * Get daily nutrition summary using aggregation
   * Single query with GROUP BY instead of multiple queries
   */
  async getDailyNutritionSummary(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const nutritionLog = await this.prisma.nutritionLog.aggregate({
      where: {
        meal: {
          dietPlan: { userId },
        },
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        deletedAt: null,
      },
      _sum: {
        calories: true,
        protein: true,
        carbs: true,
        fats: true,
      },
      _count: true,
    });

    return {
      totalCalories: nutritionLog._sum.calories || 0,
      totalProtein: nutritionLog._sum.protein || 0,
      totalCarbs: nutritionLog._sum.carbs || 0,
      totalFats: nutritionLog._sum.fats || 0,
      mealCount: nutritionLog._count,
    };
  }

  /**
   * Get upcoming appointments using index for efficient filtering
   */
  async getUpcomingAppointments(userId: string, daysAhead: number = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.appointment.findMany({
      where: {
        userId,
        scheduledTime: {
          gte: now,
          lte: futureDate,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledTime: true,
        duration: true,
        status: true,
        createdAt: true,
      },
      orderBy: { scheduledTime: 'asc' },
    });
  }

  /**
   * Get user dashboard data efficiently with parallel queries
   * Uses batch loading and aggregations to minimize database round trips
   */
  async getUserDashboardData(userId: string) {
    const [
      dietPlanCount,
      recentMeals,
      latestMetric,
      upcomingAppointments,
      dailyNutrition,
    ] = await Promise.all([
      this.prisma.dietPlan.count({ where: { userId, deletedAt: null } }),
      this.prisma.meal.findMany({
        where: { dietPlan: { userId }, deletedAt: null },
        select: QueryOptimizationService.selectFields.mealBasic,
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.metric.findFirst({
        where: { userId, type: 'WEIGHT', deletedAt: null },
        select: QueryOptimizationService.selectFields.metricBasic,
        orderBy: { recordedAt: 'desc' },
      }),
      this.getUpcomingAppointments(userId, 7),
      this.getDailyNutritionSummary(userId, new Date()),
    ]);

    return {
      dietPlanCount,
      recentMeals,
      latestMetric,
      upcomingAppointments,
      dailyNutrition,
    };
  }

  /**
   * Paginated query with count in parallel
   * Returns both data and metadata in single database call pattern
   */
  async getPaginatedResults<T>(
    findQuery: Promise<T[]>,
    countQuery: Promise<number>,
    page: number = 1,
    limit: number = 10,
  ) {
    const [data, total] = await Promise.all([findQuery, countQuery]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search foods with fulltext index support
   * Efficient pagination with field selection
   */
  async searchFoods(userId: string, query: string, limit: number = 20) {
    return this.prisma.food.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
        deletedAt: null,
      },
      select: QueryOptimizationService.selectFields.foodBasic,
      take: limit,
    });
  }

  /**
   * Get unique meal categories for a user
   * Uses database distinct to avoid post-processing
   */
  async getUniqueMealCategories(userId: string) {
    const foods = await this.prisma.food.findMany({
      where: { userId, deletedAt: null },
      select: { category: true },
      distinct: ['category'],
    });

    return foods
      .map((f) => f.category)
      .filter((c): c is string => c !== null);
  }

  /**
   * Get count of soft-deleted records for restoration operations
   * Uses index on deletedAt
   */
  async getDeletedRecordsCount(entityType: string, userId: string) {
    const entityTypeUpper = entityType.toUpperCase();

    const counts = await Promise.all([
      this.prisma.auditLog.count({
        where: { userId, action: 'DELETE', deletedAt: { not: null } },
      }),
    ]);

    return counts[0];
  }

  /**
   * Bulk update meal status efficiently
   * Single database operation for multiple records
   */
  async bulkUpdateMealStatus(mealIds: string[], status: string) {
    const result = await this.prisma.meal.updateMany({
      where: { id: { in: mealIds } },
      data: { status },
    });

    this.logger.debug(
      `Updated ${result.count} meals to status: ${status}`,
    );
    return result;
  }

  /**
   * Create diet plan with meals in transaction
   * Ensures consistency across multiple inserts
   */
  async createDietPlanWithMeals(
    userId: string,
    planData: any,
    mealsData: any[],
  ) {
    return this.prisma.$transaction(async (prisma) => {
      const plan = await prisma.dietPlan.create({
        data: {
          ...planData,
          userId,
        },
        select: QueryOptimizationService.selectFields.dietPlanBasic,
      });

      const meals = await Promise.all(
        mealsData.map((meal) =>
          prisma.meal.create({
            data: {
              ...meal,
              dietPlanId: plan.id,
            },
            select: QueryOptimizationService.selectFields.mealBasic,
          }),
        ),
      );

      return { plan, meals };
    });
  }

  /**
   * Calculate aggregated nutrition statistics for reporting
   * Single aggregation query instead of post-processing
   */
  async getAggregatedNutritionStats(userId: string, daysBack: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const stats = await this.prisma.nutritionLog.aggregate({
      where: {
        meal: { dietPlan: { userId } },
        createdAt: { gte: startDate },
        deletedAt: null,
      },
      _avg: { calories: true, protein: true, carbs: true, fats: true },
      _sum: { calories: true, protein: true, carbs: true, fats: true },
      _count: true,
    });

    return {
      avgDailyCalories: stats._avg.calories || 0,
      avgDailyProtein: stats._avg.protein || 0,
      avgDailyCarbs: stats._avg.carbs || 0,
      avgDailyFats: stats._avg.fats || 0,
      totalCalories: stats._sum.calories || 0,
      totalProtein: stats._sum.protein || 0,
      totalCarbs: stats._sum.carbs || 0,
      totalFats: stats._sum.fats || 0,
      logsCount: stats._count,
    };
  }
}
