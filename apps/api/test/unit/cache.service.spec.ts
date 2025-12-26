import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '@infrastructure/cache/cache.service';
import { Logger } from '@nestjs/common';

describe('CacheService', () => {
  let service: CacheService;
  let mockRedisClient: any;

  beforeEach(() => {
    // Mock Redis client
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      setex: jest.fn(),
      keys: jest.fn(),
      mget: jest.fn(),
      mset: jest.fn(),
      incr: jest.fn(),
      decr: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
      ping: jest.fn().mockResolvedValue('PONG'),
      quit: jest.fn(),
      on: jest.fn(),
    };

    // Mock Redis module
    jest.mock('ioredis', () => {
      return jest.fn(() => mockRedisClient);
    });
  });

  describe('get', () => {
    it('should retrieve cached value', async () => {
      const key = 'test-key';
      const value = { data: 'test' };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

      const result = await service.get(key);

      expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(value);
    });

    it('should return null if key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get('non-existent');

      expect(result).toBeNull();
    });

    it('should handle JSON parsing errors', async () => {
      mockRedisClient.get.mockResolvedValue('invalid-json');

      const result = await service.get('bad-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set cache value with TTL', async () => {
      const key = 'test-key';
      const value = { data: 'test' };
      const ttl = 3600;

      mockRedisClient.setex.mockResolvedValue('OK');

      await service.set(key, value, ttl);

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        key,
        ttl,
        JSON.stringify(value),
      );
    });
  });

  describe('delete', () => {
    it('should delete cache entry', async () => {
      const key = 'test-key';

      mockRedisClient.del.mockResolvedValue(1);

      await service.delete(key);

      expect(mockRedisClient.del).toHaveBeenCalledWith(key);
    });
  });

  describe('deletePattern', () => {
    it('should delete entries matching pattern', async () => {
      const pattern = 'user:*';

      mockRedisClient.keys.mockResolvedValue([
        'user:1',
        'user:2',
        'user:3',
      ]);
      mockRedisClient.del.mockResolvedValue(3);

      await service.deletePattern(pattern);

      expect(mockRedisClient.keys).toHaveBeenCalledWith(pattern);
      expect(mockRedisClient.del).toHaveBeenCalled();
    });
  });

  describe('invalidateUserCache', () => {
    it('should invalidate all user-specific cache entries', async () => {
      const userId = 'user-1';

      mockRedisClient.keys.mockResolvedValue([
        `user:${userId}:*`,
        `diet-plan:${userId}:*`,
      ]);
      mockRedisClient.del.mockResolvedValue(2);

      await service.invalidateUserCache(userId);

      expect(mockRedisClient.keys).toHaveBeenCalled();
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const key = 'test-key';
      const value = { data: 'cached' };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

      const getter = jest.fn().mockResolvedValue({ data: 'fresh' });

      const result = await service.getOrSet(key, getter, 3600);

      expect(result).toEqual(value);
      expect(getter).not.toHaveBeenCalled();
    });

    it('should fetch and cache value if not exists', async () => {
      const key = 'test-key';
      const value = { data: 'fresh' };

      mockRedisClient.get.mockResolvedValue(null);
      mockRedisClient.setex.mockResolvedValue('OK');

      const getter = jest.fn().mockResolvedValue(value);

      const result = await service.getOrSet(key, getter, 3600);

      expect(result).toEqual(value);
      expect(getter).toHaveBeenCalled();
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });
  });

  describe('isHealthy', () => {
    it('should return true if Redis is reachable', async () => {
      mockRedisClient.ping.mockResolvedValue('PONG');

      const healthy = await service.isHealthy();

      expect(healthy).toBe(true);
    });

    it('should return false if Redis is unreachable', async () => {
      mockRedisClient.ping.mockRejectedValue(new Error('Connection failed'));

      const healthy = await service.isHealthy();

      expect(healthy).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const stats = await service.getStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');
    });
  });

  describe('cacheMiddleware', () => {
    it('should return middleware function', () => {
      const middleware = service.cacheMiddleware('test:*', 3600);

      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // (req, res, next)
    });
  });

  describe('invalidateEntityCache', () => {
    it('should invalidate cache for specific entity', async () => {
      const entityType = 'DietPlan';
      const entityId = 'plan-1';
      const userId = 'user-1';

      mockRedisClient.del.mockResolvedValue(1);

      await service.invalidateEntityCache(entityType, entityId, userId);

      expect(mockRedisClient.del).toHaveBeenCalled();
    });
  });

  describe('warmCache', () => {
    it('should pre-load cache with data', async () => {
      const userId = 'user-1';
      const data = [{ id: '1' }, { id: '2' }];

      const getter = jest.fn().mockResolvedValue(data);
      mockRedisClient.setex.mockResolvedValue('OK');

      await service.warmCache(userId, getter);

      expect(getter).toHaveBeenCalled();
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should gracefully close Redis connection', async () => {
      mockRedisClient.quit.mockResolvedValue('OK');

      await service.close();

      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });
});
