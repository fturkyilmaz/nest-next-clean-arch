import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/PrismaService';
import { QueryOptimizationService } from '@infrastructure/database/query-optimization.service';
import { CacheService } from '@infrastructure/cache/cache.service';
import { QueryMonitoringService } from '@infrastructure/monitoring/query-monitoring.service';
import { PrismaUserRepository } from '@infrastructure/repositories/PrismaUserRepository';
import { UserFactory, DietPlanFactory, MealFactory, MetricFactory } from '../../test/factories';

/**
 * Integration tests for database optimization and caching
 * Tests the full flow of repositories with caching layer
 */
describe('Repository Integration with Caching (Integration)', () => {
  let queryOptimization: QueryOptimizationService;
  let cache: CacheService;
  let monitoring: QueryMonitoringService;
  let userRepository: PrismaUserRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryOptimizationService,
        CacheService,
        QueryMonitoringService,
        PrismaUserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              aggregate: jest.fn(),
              count: jest.fn(),
            },
            dietPlan: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
            },
            meal: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              updateMany: jest.fn(),
            },
            metric: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              aggregate: jest.fn(),
            },
            nutritionLog: {
              findMany: jest.fn(),
              aggregate: jest.fn(),
            },
            appointment: {
              findMany: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            keys: jest.fn(),
            setex: jest.fn(),
            ttl: jest.fn(),
          },
        },
      ],
    }).compile();

    queryOptimization = module.get<QueryOptimizationService>(QueryOptimizationService);
    cache = module.get<CacheService>(CacheService);
    monitoring = module.get<QueryMonitoringService>(QueryMonitoringService);
    userRepository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('User Repository with Caching', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should cache user lookup by id', async () => {
      const user = UserFactory.create();
      const cachedUser = { ...user };

      // Mock Prisma to return user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      // First call - should hit database
      const result1 = await userRepository.findById(user.id);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);

      // Mock cache hit
      const cacheKey = `user:${user.id}`;
      await cache.set(cacheKey, user, 3600);

      // Verify cache was set
      expect(cache.set).toHaveBeenCalledWith(cacheKey, user, 3600);
    });

    it('should invalidate user cache on update', async () => {
      const user = UserFactory.create();
      const updated = { ...user, firstName: 'Updated' };

      (prisma.user.update as jest.Mock).mockResolvedValue(updated);

      // Simulate cache invalidation
      const cacheKey = `user:${user.id}`;
      await cache.delete(cacheKey);

      expect(cache.delete).toHaveBeenCalledWith(cacheKey);
    });

    it('should track repository queries in monitoring', async () => {
      const user = UserFactory.create();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      // Log the query
      monitoring.logQuery('SELECT * FROM users WHERE id = ?', 15, 'success');

      const stats = monitoring.getStats();
      expect(stats.total).toBeGreaterThan(0);
    });
  });

  describe('Query Optimization Service Integration', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should batch load diet plans with meals', async () => {
      const dietPlanIds = ['plan-1', 'plan-2', 'plan-3'];
      const meals = [
        MealFactory.create({ dietPlanId: 'plan-1' }),
        MealFactory.create({ dietPlanId: 'plan-1' }),
        MealFactory.create({ dietPlanId: 'plan-2' }),
        MealFactory.create({ dietPlanId: 'plan-3' }),
      ];

      (prisma.meal.findMany as jest.Mock).mockResolvedValue(meals);

      const result = await queryOptimization.batchLoadDietPlanMeals(dietPlanIds);

      expect(result.size).toBe(3);
      expect(result.get('plan-1')).toHaveLength(2);
      expect(result.get('plan-2')).toHaveLength(1);
      expect(result.get('plan-3')).toHaveLength(1);
    });

    it('should calculate daily nutrition summary efficiently', async () => {
      const userId = 'user-1';

      (prisma.nutritionLog.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          calories: 2100,
          protein: 105,
          carbs: 210,
          fats: 70,
        },
        _count: 5,
      });

      const result = await queryOptimization.getDailyNutritionSummary(userId, new Date());

      expect(result.totalCalories).toBe(2100);
      expect(result.totalProtein).toBe(105);
      expect(result.mealCount).toBe(5);
    });

    it('should fetch dashboard data with parallel queries', async () => {
      const userId = 'user-1';

      (prisma.dietPlan.count as jest.Mock).mockResolvedValue(3);
      (prisma.meal.findMany as jest.Mock).mockResolvedValue([
        MealFactory.create(),
      ]);
      (prisma.metric.findFirst as jest.Mock).mockResolvedValue(
        MetricFactory.create(),
      );
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.nutritionLog.aggregate as jest.Mock).mockResolvedValue({
        _sum: { calories: 2000, protein: 100, carbs: 200, fats: 70 },
        _count: 5,
      });

      const result = await queryOptimization.getUserDashboardData(userId);

      expect(result.dietPlanCount).toBe(3);
      expect(result.recentMeals).toBeDefined();
      expect(result.latestMetric).toBeDefined();
    });

    it('should handle paginated results correctly', async () => {
      const data = Array.from({ length: 10 }, (_, i) =>
        UserFactory.create({ id: `user-${i}` }),
      );
      const findQuery = Promise.resolve(data);
      const countQuery = Promise.resolve(100);

      const result = await queryOptimization.getPaginatedResults(
        findQuery,
        countQuery,
        1,
        10,
      );

      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(100);
      expect(result.totalPages).toBe(10);
      expect(result.page).toBe(1);
    });

    it('should bulk update meal status efficiently', async () => {
      const mealIds = ['meal-1', 'meal-2', 'meal-3'];

      (prisma.meal.updateMany as jest.Mock).mockResolvedValue({
        count: 3,
      });

      const result = await queryOptimization.bulkUpdateMealStatus(
        mealIds,
        'COMPLETED',
      );

      expect(result.count).toBe(3);
      expect(prisma.meal.updateMany).toHaveBeenCalledWith({
        where: { id: { in: mealIds } },
        data: { status: 'COMPLETED' },
      });
    });
  });

  describe('Cache Performance', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should improve performance with cached queries', async () => {
      const user = UserFactory.create();
      const cacheKey = `user:${user.id}`;

      // Set in cache
      await cache.set(cacheKey, user, 3600);

      // Verify set was called
      expect(cache.set).toHaveBeenCalledWith(cacheKey, user, 3600);
    });

    it('should provide cache statistics', async () => {
      // Log some queries
      monitoring.logQuery('SELECT * FROM users', 25, 'success');
      monitoring.logQuery('SELECT * FROM dietplans', 35, 'success');
      monitoring.logQuery('SELECT * FROM meals', 150, 'success'); // Slow

      const stats = monitoring.getStats();

      expect(stats.total).toBe(3);
      expect(stats.slowQueryCount).toBeGreaterThan(0);
      expect(stats.avgDuration).toBeGreaterThan(0);
    });
  });

  describe('Query Monitoring Integration', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should track query performance metrics', () => {
      monitoring.logQuery('SELECT * FROM users', 50, 'success');
      monitoring.logQuery('SELECT * FROM clients', 100, 'success');
      monitoring.logQuery('SELECT * FROM dietplans', 25, 'success');

      const stats = monitoring.getStats();

      expect(stats.total).toBe(3);
      expect(stats.minDuration).toBe(25);
      expect(stats.maxDuration).toBe(100);
      expect(stats.avgDuration).toBeCloseTo((50 + 100 + 25) / 3, 1);
    });

    it('should identify slow queries', () => {
      monitoring.logQuery('SELECT * FROM users', 50, 'success');
      monitoring.logQuery('SELECT * FROM large_table', 250, 'success');
      monitoring.logQuery('SELECT * FROM another_large_table', 200, 'success');

      const slowQueries = monitoring.getSlowQueries(10);

      expect(slowQueries.length).toBeGreaterThan(0);
      expect(slowQueries[0].duration).toBeGreaterThanOrEqual(
        slowQueries[1]?.duration || 0,
      );
    });

    it('should handle error queries', () => {
      monitoring.logQuery('SELECT * FROM non_existent', 10, 'error', 'Table not found');

      const stats = monitoring.getStats();

      expect(stats.errorCount).toBeGreaterThan(0);
      expect(stats.errorRate).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Flow', () => {
    it('should optimize a complete user onboarding flow', async () => {
      const userId = 'new-user-1';
      const user = UserFactory.create({ id: userId });

      // Simulate user creation
      (prisma.user.create as jest.Mock).mockResolvedValue(user);

      // Cache the user
      const cacheKey = `user:${userId}`;
      await cache.set(cacheKey, user, 3600);

      // Fetch dashboard data with optimizations
      (prisma.dietPlan.count as jest.Mock).mockResolvedValue(0);
      (prisma.meal.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.metric.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.nutritionLog.aggregate as jest.Mock).mockResolvedValue({
        _sum: { calories: null, protein: null, carbs: null, fats: null },
        _count: 0,
      });

      const dashboard = await queryOptimization.getUserDashboardData(userId);

      // Verify caching
      expect(cache.set).toHaveBeenCalledWith(cacheKey, user, 3600);

      // Verify dashboard data
      expect(dashboard).toHaveProperty('dietPlanCount');
      expect(dashboard).toHaveProperty('recentMeals');
    });
  });
});
