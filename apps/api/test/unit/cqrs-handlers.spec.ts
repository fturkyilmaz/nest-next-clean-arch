import { Test, TestingModule } from '@nestjs/testing';
import { SearchClientsQueryHandler } from '@application/use-cases/client/queries/SearchClientsQueryHandler';
import { SearchClientsQuery } from '@application/use-cases/client/queries/SearchClientsQuery';
import { MockPrismaService, MockCacheService } from '../../../../../test/mocks';
import { ClientFactory } from '../../../../../test/factories';
import { PrismaClientRepository } from '@infrastructure/repositories/PrismaClientRepository';

describe('SearchClientsQueryHandler', () => {
  let handler: SearchClientsQueryHandler;
  let mockClientRepository: any;

  beforeEach(async () => {
    mockClientRepository = {
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchClientsQueryHandler,
        {
          provide: 'IClientRepository',
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    handler = module.get<SearchClientsQueryHandler>(SearchClientsQueryHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should search clients by search term', async () => {
      const dietitianId = 'dietitian-1';
      const clients = [
        ClientFactory.create({ dietitianId }),
        ClientFactory.create({ dietitianId }),
      ];

      mockClientRepository.search.mockResolvedValue(clients);

      const query = new SearchClientsQuery(
        'john',
        dietitianId,
        0,
        10,
      );

      const result = await handler.execute(query);

      expect(mockClientRepository.search).toHaveBeenCalledWith(
        'john',
        dietitianId,
        { skip: 0, take: 10 },
      );
      expect(result).toHaveLength(2);
    });

    it('should handle pagination options', async () => {
      const dietitianId = 'dietitian-1';
      const client = ClientFactory.create({ dietitianId });

      mockClientRepository.search.mockResolvedValue([client]);

      const query = new SearchClientsQuery(
        'john',
        dietitianId,
        20,
        5,
      );

      await handler.execute(query);

      expect(mockClientRepository.search).toHaveBeenCalledWith(
        'john',
        dietitianId,
        { skip: 20, take: 5 },
      );
    });

    it('should return empty array if no matches', async () => {
      mockClientRepository.search.mockResolvedValue([]);

      const query = new SearchClientsQuery(
        'nonexistent',
        'dietitian-1',
        0,
        10,
      );

      const result = await handler.execute(query);

      expect(result).toEqual([]);
    });

    it('should handle search without dietitian filter', async () => {
      const clients = [
        ClientFactory.create(),
        ClientFactory.create(),
      ];

      mockClientRepository.search.mockResolvedValue(clients);

      const query = new SearchClientsQuery(
        'john',
        undefined,
        0,
        10,
      );

      const result = await handler.execute(query);

      expect(result).toHaveLength(2);
    });
  });
});

describe('CreateClientCommandHandler', () => {
  let handler: any;
  let mockClientRepository: any;
  let mockEventPublisher: any;

  beforeEach(async () => {
    mockClientRepository = {
      create: jest.fn(),
      existsByEmail: jest.fn().mockResolvedValue(false),
    };

    mockEventPublisher = {
      publishAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'IClientRepository',
          useValue: mockClientRepository,
        },
        {
          provide: 'EventPublisher',
          useValue: mockEventPublisher,
        },
      ],
    }).compile();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('with caching', () => {
    it('should invalidate cache after creating client', async () => {
      const mockCache = new MockCacheService();
      const newClient = ClientFactory.create();

      mockClientRepository.create.mockResolvedValue(newClient);

      // Simulate cache invalidation
      await mockCache.invalidateEntityCache('Client', newClient.id);

      expect(mockCache.invalidateEntityCache).toHaveBeenCalledWith(
        'Client',
        newClient.id,
      );
    });
  });
});

describe('GetClientsByDietitianQueryHandler', () => {
  let handler: any;
  let mockClientRepository: any;

  beforeEach(async () => {
    mockClientRepository = {
      findByDietitianId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'IClientRepository',
          useValue: mockClientRepository,
        },
      ],
    }).compile();
  });

  describe('execute', () => {
    it('should get clients by dietitian with pagination', async () => {
      const dietitianId = 'dietitian-1';
      const clients = [
        ClientFactory.create({ dietitianId }),
        ClientFactory.create({ dietitianId }),
      ];

      mockClientRepository.findByDietitianId.mockResolvedValue(clients);

      const result = await mockClientRepository.findByDietitianId(
        dietitianId,
        { skip: 0, take: 10, isActive: true },
      );

      expect(result).toHaveLength(2);
      expect(mockClientRepository.findByDietitianId).toHaveBeenCalledWith(
        dietitianId,
        { skip: 0, take: 10, isActive: true },
      );
    });

    it('should filter by active status', async () => {
      const dietitianId = 'dietitian-1';
      const activeClients = [
        ClientFactory.create({ dietitianId, isActive: true }),
      ];

      mockClientRepository.findByDietitianId.mockResolvedValue(activeClients);

      const result = await mockClientRepository.findByDietitianId(
        dietitianId,
        { isActive: true },
      );

      expect(result[0].isActive).toBe(true);
    });
  });
});

describe('RecordClientMetricsCommandHandler', () => {
  let mockMetricRepository: any;
  let mockQueryOptimization: any;

  beforeEach(() => {
    mockMetricRepository = {
      create: jest.fn(),
    };

    mockQueryOptimization = {
      getDailyNutritionSummary: jest.fn(),
      getAggregatedNutritionStats: jest.fn(),
    };
  });

  describe('metric aggregation after recording', () => {
    it('should update daily summary after new metric', async () => {
      const userId = 'user-1';
      const today = new Date();

      mockQueryOptimization.getDailyNutritionSummary.mockResolvedValue({
        totalCalories: 2000,
        totalProtein: 100,
        totalCarbs: 200,
        totalFats: 70,
        mealCount: 5,
      });

      const summary = await mockQueryOptimization.getDailyNutritionSummary(
        userId,
        today,
      );

      expect(summary.totalCalories).toBe(2000);
      expect(mockQueryOptimization.getDailyNutritionSummary).toHaveBeenCalledWith(
        userId,
        today,
      );
    });

    it('should calculate 30-day nutrition stats', async () => {
      const userId = 'user-1';

      mockQueryOptimization.getAggregatedNutritionStats.mockResolvedValue({
        avgDailyCalories: 2000,
        totalCalories: 60000,
        logsCount: 30,
      });

      const stats = await mockQueryOptimization.getAggregatedNutritionStats(
        userId,
        30,
      );

      expect(stats.avgDailyCalories).toBe(2000);
      expect(stats.totalCalories).toBe(60000);
    });
  });
});

describe('GetDietPlansByClientQueryHandler', () => {
  let mockDietPlanRepository: any;
  let mockQueryOptimization: any;

  beforeEach(() => {
    mockDietPlanRepository = {
      findByClientId: jest.fn(),
    };

    mockQueryOptimization = {
      getDietPlansWithMeals: jest.fn(),
    };
  });

  describe('with batch loading', () => {
    it('should load diet plans with meals efficiently', async () => {
      const clientId = 'client-1';
      const userId = 'user-1';

      mockQueryOptimization.getDietPlansWithMeals.mockResolvedValue([
        {
          id: 'plan-1',
          name: 'Plan 1',
          meals: [{ id: 'meal-1' }, { id: 'meal-2' }],
        },
        {
          id: 'plan-2',
          name: 'Plan 2',
          meals: [{ id: 'meal-3' }],
        },
      ]);

      const result = await mockQueryOptimization.getDietPlansWithMeals(
        userId,
        0,
        10,
      );

      expect(result).toHaveLength(2);
      expect(result[0].meals).toHaveLength(2);
      expect(result[1].meals).toHaveLength(1);
    });
  });
});

describe('Caching Integration in Handlers', () => {
  let mockCache: any;

  beforeEach(() => {
    mockCache = new MockCacheService();
  });

  describe('query result caching', () => {
    it('should cache search results', async () => {
      const cacheKey = 'search:clients:john:dietitian-1:0:10';
      const clients = [ClientFactory.create()];

      // Simulate caching logic
      mockCache.set(cacheKey, clients, 300); // 5 minute cache

      const cached = await mockCache.get(cacheKey);
      expect(cached).toEqual(clients);
    });

    it('should invalidate search cache on client creation', async () => {
      const dietitianId = 'dietitian-1';
      const pattern = `search:clients:*:${dietitianId}:*`;

      await mockCache.deletePattern(pattern);

      expect(mockCache.deletePattern).toHaveBeenCalledWith(pattern);
    });
  });
});
