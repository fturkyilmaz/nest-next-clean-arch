/**
 * Test Mocks & Builders
 *
 * Reusable mock services and test helpers for unit testing.
 */

import { Logger } from '@nestjs/common';

/**
 * Mock Prisma Service for isolated unit tests
 */
export class MockPrismaService {
  user = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  client = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  dietPlan = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  meal = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  food = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  metric = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  appointment = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  nutritionLog = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  auditLog = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  userSession = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  refreshToken = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  $transaction = jest.fn((cb) => cb(this));
}

/**
 * Mock Redis/Cache Service for isolated unit tests
 */
export class MockCacheService {
  get = jest.fn().mockResolvedValue(null);
  set = jest.fn().mockResolvedValue(undefined);
  delete = jest.fn().mockResolvedValue(undefined);
  deletePattern = jest.fn().mockResolvedValue(undefined);
  invalidateUserCache = jest.fn().mockResolvedValue(undefined);
  invalidateEntityCache = jest.fn().mockResolvedValue(undefined);
  getOrSet = jest.fn((key, getter) => getter());
  cacheMiddleware = jest.fn(() => (req, res, next) => next());
  warmCache = jest.fn().mockResolvedValue(undefined);
  getStats = jest.fn().mockReturnValue({ hits: 0, misses: 0 });
  isHealthy = jest.fn().mockResolvedValue(true);
  close = jest.fn().mockResolvedValue(undefined);
}

/**
 * Mock Query Monitoring Service for isolated unit tests
 */
export class MockQueryMonitoringService {
  logQuery = jest.fn();
  getStats = jest.fn().mockReturnValue({
    total: 0,
    avgDuration: 0,
    maxDuration: 0,
    minDuration: 0,
    errorCount: 0,
    slowQueryCount: 0,
  });
  getSlowQueries = jest.fn().mockReturnValue([]);
  getRecentQueries = jest.fn().mockReturnValue([]);
  reset = jest.fn();
  export = jest.fn().mockReturnValue({ metrics: [], stats: {} });
}

/**
 * Mock Query Optimization Service for isolated unit tests
 */
export class MockQueryOptimizationService {
  batchLoadDietPlanMeals = jest.fn().mockResolvedValue(new Map());
  batchLoadMealNutrition = jest.fn().mockResolvedValue(new Map());
  getDietPlansWithMeals = jest.fn().mockResolvedValue([]);
  getUserMetricsInRange = jest.fn().mockResolvedValue([]);
  getDailyNutritionSummary = jest.fn().mockResolvedValue({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    mealCount: 0,
  });
  getUpcomingAppointments = jest.fn().mockResolvedValue([]);
  getUserDashboardData = jest.fn().mockResolvedValue({
    dietPlanCount: 0,
    recentMeals: [],
    latestMetric: null,
    upcomingAppointments: [],
    dailyNutrition: {},
  });
  getPaginatedResults = jest.fn().mockResolvedValue({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  searchFoods = jest.fn().mockResolvedValue([]);
  getUniqueMealCategories = jest.fn().mockResolvedValue([]);
  getDeletedRecordsCount = jest.fn().mockResolvedValue(0);
  bulkUpdateMealStatus = jest.fn().mockResolvedValue({ count: 0 });
  createDietPlanWithMeals = jest.fn().mockResolvedValue({ plan: {}, meals: [] });
  getAggregatedNutritionStats = jest.fn().mockResolvedValue({});
}

/**
 * Test Logger that captures logs for assertions
 */
export class TestLogger extends Logger {
  logs: Array<{ level: string; message: string; context?: string }> = [];

  log(message: string, context?: string) {
    this.logs.push({ level: 'log', message, context });
    super.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logs.push({ level: 'error', message, context });
    super.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logs.push({ level: 'warn', message, context });
    super.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logs.push({ level: 'debug', message, context });
    super.debug(message, context);
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
  }
}

/**
 * Helper to create a mock request object for middleware testing
 */
export function createMockRequest(overrides?: any) {
  return {
    headers: { 'correlation-id': 'test-id' },
    method: 'GET',
    url: '/test',
    ...overrides,
  };
}

/**
 * Helper to create a mock response object for middleware testing
 */
export function createMockResponse(overrides?: any) {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
    ...overrides,
  };
}

/**
 * Helper to create a mock next function for middleware testing
 */
export function createMockNext() {
  return jest.fn();
}
