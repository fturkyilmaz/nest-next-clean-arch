import { Test, TestingModule } from '@nestjs/testing';
import { QueryOptimizationService } from '@infrastructure/database/query-optimization.service';
import { MockPrismaService } from '../../../test/mocks';
import { MealFactory, DietPlanFactory, MetricFactory } from '../../../test/factories';

describe('QueryOptimizationService', () => {
  let service: QueryOptimizationService;
  let mockPrisma: MockPrismaService;

  beforeEach(async () => {
    mockPrisma = new MockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryOptimizationService,
        {
          provide: 'PrismaService',
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<QueryOptimizationService>(QueryOptimizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('batchLoadDietPlanMeals', () => {
    it('should batch load meals for multiple diet plans', async () => {
      const dietPlanId1 = 'plan-1';
      const dietPlanId2 = 'plan-2';
      const meals = [
        MealFactory.create({ dietPlanId: dietPlanId1 }),
        MealFactory.create({ dietPlanId: dietPlanId1 }),
        MealFactory.create({ dietPlanId: dietPlanId2 }),
      ];

      mockPrisma.meal.findMany.mockResolvedValue(meals);

      const result = await service.batchLoadDietPlanMeals([
        dietPlanId1,
        dietPlanId2,
      ]);

      expect(mockPrisma.meal.findMany).toHaveBeenCalledWith({
        where: {
          dietPlanId: { in: [dietPlanId1, dietPlanId2] },
          deletedAt: null,
        },
        select: expect.any(Object),
      });

      expect(result.get(dietPlanId1)).toHaveLength(2);
      expect(result.get(dietPlanId2)).toHaveLength(1);
    });

    it('should return empty map for non-existent diet plans', async () => {
      mockPrisma.meal.findMany.mockResolvedValue([]);

      const result = await service.batchLoadDietPlanMeals(['non-existent']);

      expect(result.get('non-existent')).toEqual([]);
    });
  });

  describe('getDailyNutritionSummary', () => {
    it('should calculate daily nutrition summary', async () => {
      const userId = 'user-1';
      const today = new Date();

      mockPrisma.nutritionLog.aggregate.mockResolvedValue({
        _sum: {
          calories: 2000,
          protein: 100,
          carbs: 200,
          fats: 70,
        },
        _count: 5,
      });

      const result = await service.getDailyNutritionSummary(userId, today);

      expect(result).toEqual({
        totalCalories: 2000,
        totalProtein: 100,
        totalCarbs: 200,
        totalFats: 70,
        mealCount: 5,
      });
    });

    it('should return zeros for no nutrition logs', async () => {
      const userId = 'user-1';

      mockPrisma.nutritionLog.aggregate.mockResolvedValue({
        _sum: { calories: null, protein: null, carbs: null, fats: null },
        _count: 0,
      });

      const result = await service.getDailyNutritionSummary(userId, new Date());

      expect(result.totalCalories).toBe(0);
      expect(result.mealCount).toBe(0);
    });
  });

  describe('getUpcomingAppointments', () => {
    it('should get upcoming appointments within days ahead', async () => {
      const userId = 'user-1';
      const appointments = [
        { id: 'apt-1', scheduledTime: new Date(Date.now() + 86400000) },
        { id: 'apt-2', scheduledTime: new Date(Date.now() + 172800000) },
      ];

      mockPrisma.appointment.findMany.mockResolvedValue(appointments);

      const result = await service.getUpcomingAppointments(userId, 7);

      expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            deletedAt: null,
          }),
        }),
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('getUserDashboardData', () => {
    it('should fetch dashboard data efficiently with parallel queries', async () => {
      const userId = 'user-1';

      mockPrisma.dietPlan.count.mockResolvedValue(5);
      mockPrisma.meal.findMany.mockResolvedValue([
        MealFactory.create(),
        MealFactory.create(),
      ]);
      mockPrisma.metric.findFirst.mockResolvedValue(MetricFactory.create());
      mockPrisma.appointment.findMany.mockResolvedValue([]);
      mockPrisma.nutritionLog.aggregate.mockResolvedValue({
        _sum: { calories: 1500, protein: 80, carbs: 150, fats: 50 },
        _count: 3,
      });

      const result = await service.getUserDashboardData(userId);

      expect(result.dietPlanCount).toBe(5);
      expect(result.recentMeals).toHaveLength(2);
      expect(result.latestMetric).toBeDefined();
    });
  });

  describe('getPaginatedResults', () => {
    it('should return paginated results with metadata', async () => {
      const data = [{ id: '1' }, { id: '2' }];
      const findQuery = Promise.resolve(data);
      const countQuery = Promise.resolve(100);

      const result = await service.getPaginatedResults(
        findQuery,
        countQuery,
        1,
        10,
      );

      expect(result.data).toEqual(data);
      expect(result.total).toBe(100);
      expect(result.totalPages).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('searchFoods', () => {
    it('should search foods by name or category', async () => {
      const userId = 'user-1';
      const foods = [
        { id: '1', name: 'Apple', category: 'FRUIT' },
        { id: '2', name: 'Banana', category: 'FRUIT' },
      ];

      mockPrisma.food.findMany.mockResolvedValue(foods);

      const result = await service.searchFoods(userId, 'fruit');

      expect(mockPrisma.food.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
          }),
        }),
      );

      expect(result).toHaveLength(2);
    });
  });

  describe('bulkUpdateMealStatus', () => {
    it('should update multiple meals in single operation', async () => {
      const mealIds = ['meal-1', 'meal-2', 'meal-3'];
      const status = 'COMPLETED';

      mockPrisma.meal.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.bulkUpdateMealStatus(mealIds, status);

      expect(mockPrisma.meal.updateMany).toHaveBeenCalledWith({
        where: { id: { in: mealIds } },
        data: { status },
      });

      expect(result.count).toBe(3);
    });
  });

  describe('createDietPlanWithMeals', () => {
    it('should create diet plan with meals in transaction', async () => {
      const userId = 'user-1';
      const planData = { name: 'Test Plan', clientId: 'client-1' };
      const mealsData = [{ name: 'Breakfast' }, { name: 'Lunch' }];

      const mockTransaction = jest
        .fn()
        .mockResolvedValue({ plan: { id: 'plan-1' }, meals: [{}, {}] });

      mockPrisma.$transaction = mockTransaction;

      await service.createDietPlanWithMeals(userId, planData, mealsData);

      expect(mockTransaction).toHaveBeenCalled();
    });
  });

  describe('getAggregatedNutritionStats', () => {
    it('should calculate aggregated nutrition statistics', async () => {
      const userId = 'user-1';

      mockPrisma.nutritionLog.aggregate.mockResolvedValue({
        _avg: { calories: 300, protein: 20, carbs: 40, fats: 10 },
        _sum: { calories: 6000, protein: 400, carbs: 800, fats: 200 },
        _count: 20,
      });

      const result = await service.getAggregatedNutritionStats(userId, 30);

      expect(result.avgDailyCalories).toBe(300);
      expect(result.totalCalories).toBe(6000);
      expect(result.logsCount).toBe(20);
    });
  });
});
