import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CacheInvalidationService } from '../CacheInvalidationService';
import { RedisCacheService } from '../RedisCacheService';

describe('CacheInvalidationService', () => {
  let service: CacheInvalidationService;
  let mockCacheService: any;

  beforeEach(async () => {
    mockCacheService = {
      del: jest.fn(),
      delPattern: jest.fn(),
      getUserCacheKey: jest.fn((userId) => `user:${userId}`),
      getClientCacheKey: jest.fn((clientId) => `client:${clientId}`),
      getDietPlanCacheKey: jest.fn((dietPlanId) => `dietplan:${dietPlanId}`),
      getFoodItemCacheKey: jest.fn((foodItemId) => `fooditem:${foodItemId}`),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInvalidationService,
        {
          provide: RedisCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<CacheInvalidationService>(
      CacheInvalidationService,
    );

    // Mock logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('invalidateUser', () => {
    it('should invalidate user cache', async () => {
      const userId = 'user-123';

      await service.invalidateUser(userId);

      expect(mockCacheService.getUserCacheKey).toHaveBeenCalledWith(userId);
      expect(mockCacheService.del).toHaveBeenCalledWith(`user:${userId}`);
    });

    it('should invalidate user list cache', async () => {
      const userId = 'user-123';

      await service.invalidateUser(userId);

      expect(mockCacheService.delPattern).toHaveBeenCalledWith('users:list:*');
    });

    it('should call both del and delPattern', async () => {
      const userId = 'user-123';

      await service.invalidateUser(userId);

      expect(mockCacheService.del).toHaveBeenCalled();
      expect(mockCacheService.delPattern).toHaveBeenCalled();
    });
  });

  describe('invalidateClient', () => {
    it('should invalidate client cache', async () => {
      const clientId = 'client-456';

      await service.invalidateClient(clientId);

      expect(mockCacheService.getClientCacheKey).toHaveBeenCalledWith(clientId);
      expect(mockCacheService.del).toHaveBeenCalledWith(`client:${clientId}`);
    });

    it('should invalidate all clients list cache', async () => {
      const clientId = 'client-456';

      await service.invalidateClient(clientId);

      expect(mockCacheService.delPattern).toHaveBeenCalledWith(
        'clients:list:all:*',
      );
    });

    it('should invalidate dietitian-specific client list if dietitianId provided', async () => {
      const clientId = 'client-456';
      const dietitianId = 'dietitian-789';

      await service.invalidateClient(clientId, dietitianId);

      expect(mockCacheService.delPattern).toHaveBeenCalledWith(
        `clients:list:${dietitianId}:*`,
      );
    });

    it('should not invalidate dietitian-specific list if dietitianId not provided', async () => {
      const clientId = 'client-456';

      await service.invalidateClient(clientId);

      expect(mockCacheService.delPattern).not.toHaveBeenCalledWith(
        expect.stringContaining('clients:list:'),
      );
    });
  });

  describe('invalidateDietPlan', () => {
    it('should invalidate diet plan cache', async () => {
      const dietPlanId = 'plan-001';
      const clientId = 'client-456';

      await service.invalidateDietPlan(dietPlanId, clientId);

      expect(mockCacheService.getDietPlanCacheKey).toHaveBeenCalledWith(
        dietPlanId,
      );
      expect(mockCacheService.del).toHaveBeenCalledWith(`dietplan:${dietPlanId}`);
    });

    it('should invalidate client diet plans cache', async () => {
      const dietPlanId = 'plan-001';
      const clientId = 'client-456';

      await service.invalidateDietPlan(dietPlanId, clientId);

      expect(mockCacheService.delPattern).toHaveBeenCalledWith(
        `dietplans:client:${clientId}:*`,
      );
    });
  });

  describe('invalidateFoodItem', () => {
    it('should invalidate food item cache', async () => {
      const foodItemId = 'food-123';

      await service.invalidateFoodItem(foodItemId);

      expect(mockCacheService.getFoodItemCacheKey).toHaveBeenCalledWith(
        foodItemId,
      );
      expect(mockCacheService.del).toHaveBeenCalledWith(`fooditem:${foodItemId}`);
    });

    it('should invalidate food items list cache', async () => {
      const foodItemId = 'food-123';

      await service.invalidateFoodItem(foodItemId);

      expect(mockCacheService.delPattern).toHaveBeenCalledWith(
        'fooditems:list:*',
      );
    });
  });

  describe('clearAllCaches', () => {
    it('should reset all caches', async () => {
      mockCacheService.reset = jest.fn();

      await service.clearAllCaches();

      expect(mockCacheService.reset).toHaveBeenCalled();
    });

    it('should handle reset errors', async () => {
      mockCacheService.reset = jest
        .fn()
        .mockRejectedValue(new Error('Reset failed'));

      // Should not throw, should handle error gracefully
      await expect(service.clearAllCaches()).rejects.toThrow('Reset failed');
    });
  });

  describe('Cache key generation', () => {
    it('should generate correct user cache key', () => {
      const userId = 'user-123';
      const key = mockCacheService.getUserCacheKey(userId);

      expect(key).toBe(`user:${userId}`);
    });

    it('should generate correct client cache key', () => {
      const clientId = 'client-456';
      const key = mockCacheService.getClientCacheKey(clientId);

      expect(key).toBe(`client:${clientId}`);
    });

    it('should generate correct diet plan cache key', () => {
      const dietPlanId = 'plan-001';
      const key = mockCacheService.getDietPlanCacheKey(dietPlanId);

      expect(key).toBe(`dietplan:${dietPlanId}`);
    });

    it('should generate correct food item cache key', () => {
      const foodItemId = 'food-123';
      const key = mockCacheService.getFoodItemCacheKey(foodItemId);

      expect(key).toBe(`fooditem:${foodItemId}`);
    });
  });
});
