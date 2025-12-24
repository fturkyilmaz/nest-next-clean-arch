import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisCacheService } from '../RedisCacheService';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
      store: {
        keys: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should retrieve a value from cache', async () => {
      const testKey = 'test:key';
      const testValue = { id: 1, name: 'Test' };

      mockCacheManager.get.mockResolvedValue(testValue);

      const result = await service.get(testKey);

      expect(result).toEqual(testValue);
      expect(mockCacheManager.get).toHaveBeenCalledWith(testKey);
    });

    it('should return undefined if key does not exist', async () => {
      const testKey = 'non:existent';

      mockCacheManager.get.mockResolvedValue(undefined);

      const result = await service.get(testKey);

      expect(result).toBeUndefined();
      expect(mockCacheManager.get).toHaveBeenCalledWith(testKey);
    });
  });

  describe('set', () => {
    it('should set a value in cache with TTL', async () => {
      const testKey = 'test:key';
      const testValue = { id: 1, name: 'Test' };
      const ttl = 3600;

      mockCacheManager.set.mockResolvedValue(undefined);

      await service.set(testKey, testValue, ttl);

      expect(mockCacheManager.set).toHaveBeenCalledWith(testKey, testValue, ttl);
    });

    it('should set a value in cache without TTL', async () => {
      const testKey = 'test:key';
      const testValue = { id: 1, name: 'Test' };

      mockCacheManager.set.mockResolvedValue(undefined);

      await service.set(testKey, testValue);

      expect(mockCacheManager.set).toHaveBeenCalledWith(testKey, testValue, undefined);
    });
  });

  describe('del', () => {
    it('should delete a key from cache', async () => {
      const testKey = 'test:key';

      mockCacheManager.del.mockResolvedValue(undefined);

      await service.del(testKey);

      expect(mockCacheManager.del).toHaveBeenCalledWith(testKey);
    });
  });

  describe('delPattern', () => {
    it('should delete all keys matching pattern using store.keys array method', async () => {
      const pattern = 'user:*';
      const keys = ['user:1', 'user:2', 'user:3'];

      mockCacheManager.store.keys = jest.fn().mockResolvedValue(keys);
      mockCacheManager.del.mockResolvedValue(undefined);

      await service.delPattern(pattern);

      expect(mockCacheManager.store.keys).toHaveBeenCalledWith(pattern);
      expect(mockCacheManager.del).toHaveBeenCalledTimes(3);
    });

    it('should delete matching keys using regex when keys is a function', async () => {
      const pattern = 'user:*';
      const allKeys = ['user:1', 'user:2', 'other:key'];

      mockCacheManager.store.keys = jest.fn().mockResolvedValue(allKeys);
      mockCacheManager.del.mockResolvedValue(undefined);

      await service.delPattern(pattern);

      expect(mockCacheManager.del).toHaveBeenCalledTimes(2);
    });

    it('should handle no matching keys', async () => {
      const pattern = 'nonexistent:*';

      mockCacheManager.store.keys = jest.fn().mockResolvedValue([]);
      mockCacheManager.del.mockResolvedValue(undefined);

      await service.delPattern(pattern);

      expect(mockCacheManager.del).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset cache using store.reset', async () => {
      const mockReset = jest.fn().mockResolvedValue(undefined);
      mockCacheManager.store.reset = mockReset;

      await service.reset();

      expect(mockReset).toHaveBeenCalled();
    });

    it('should reset cache using cacheManager.reset', async () => {
      const mockReset = jest.fn().mockResolvedValue(undefined);
      mockCacheManager.reset = mockReset;
      mockCacheManager.store = { reset: undefined };

      await service.reset();

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Cache Key Helpers', () => {
    describe('getUserCacheKey', () => {
      it('should generate correct user cache key', () => {
        const userId = 'user-123';
        const key = service.getUserCacheKey(userId);

        expect(key).toBe('user:user-123');
      });
    });

    describe('getClientCacheKey', () => {
      it('should generate correct client cache key', () => {
        const clientId = 'client-456';
        const key = service.getClientCacheKey(clientId);

        expect(key).toBe('client:client-456');
      });
    });

    describe('getDietPlanCacheKey', () => {
      it('should generate correct diet plan cache key', () => {
        const dietPlanId = 'plan-789';
        const key = service.getDietPlanCacheKey(dietPlanId);

        expect(key).toBe('dietplan:plan-789');
      });
    });

    describe('getFoodItemCacheKey', () => {
      it('should generate correct food item cache key', () => {
        const foodItemId = 'food-012';
        const key = service.getFoodItemCacheKey(foodItemId);

        expect(key).toBe('fooditem:food-012');
      });
    });

    describe('getUserListCacheKey', () => {
      it('should generate user list cache key without filters', () => {
        const key = service.getUserListCacheKey();

        expect(key).toBe('users:list:all');
      });

      it('should generate user list cache key with filters', () => {
        const filters = { role: 'ADMIN', status: 'ACTIVE' };
        const key = service.getUserListCacheKey(filters);

        expect(key).toContain('users:list:');
        expect(key).toContain(JSON.stringify(filters));
      });
    });

    describe('getClientListCacheKey', () => {
      it('should generate client list cache key without dietitian ID', () => {
        const key = service.getClientListCacheKey();

        expect(key).toBe('clients:list:all:all');
      });

      it('should generate client list cache key with dietitian ID', () => {
        const dietitianId = 'dietitian-123';
        const key = service.getClientListCacheKey(dietitianId);

        expect(key).toContain(`clients:list:${dietitianId}`);
      });

      it('should generate client list cache key with dietitian ID and filters', () => {
        const dietitianId = 'dietitian-123';
        const filters = { status: 'ACTIVE' };
        const key = service.getClientListCacheKey(dietitianId, filters);

        expect(key).toContain(`clients:list:${dietitianId}`);
        expect(key).toContain(JSON.stringify(filters));
      });
    });
  });
});
