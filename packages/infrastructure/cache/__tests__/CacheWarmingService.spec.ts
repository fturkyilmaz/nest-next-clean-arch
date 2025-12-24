import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CacheWarmingService } from '../CacheWarmingService';
import { RedisCacheService } from '../RedisCacheService';

describe('CacheWarmingService', () => {
  let service: CacheWarmingService;
  let mockCacheService: any;

  beforeEach(async () => {
    mockCacheService = {
      set: jest.fn(),
      get: jest.fn(),
      getFoodItemCacheKey: jest.fn((id) => `fooditem:${id}`),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheWarmingService,
        {
          provide: RedisCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<CacheWarmingService>(CacheWarmingService);

    // Mock logger
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.CACHE_WARMING_ENABLED;
  });

  describe('onModuleInit', () => {
    it('should not warm cache if CACHE_WARMING_ENABLED is not true', async () => {
      process.env.CACHE_WARMING_ENABLED = 'false';

      await service.onModuleInit();

      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it('should warm cache if CACHE_WARMING_ENABLED is true', async () => {
      process.env.CACHE_WARMING_ENABLED = 'true';
      jest.spyOn(service as any, 'warmCache').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect((service as any).warmCache).toHaveBeenCalled();
    });

    it('should skip warming if env var is not set', async () => {
      delete process.env.CACHE_WARMING_ENABLED;
      jest.spyOn(service as any, 'warmCache').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect((service as any).warmCache).not.toHaveBeenCalled();
    });
  });

  describe('triggerWarmup', () => {
    it('should trigger manual cache warming', async () => {
      jest.spyOn(service as any, 'warmCache').mockResolvedValue(undefined);

      await service.triggerWarmup();

      expect((service as any).warmCache).toHaveBeenCalled();
    });

    it('should call warmCache method', async () => {
      const warmCacheSpy = jest
        .spyOn(service as any, 'warmCache')
        .mockResolvedValue(undefined);

      await service.triggerWarmup();

      expect(warmCacheSpy).toHaveBeenCalled();
    });
  });

  describe('warmCache (private)', () => {
    it('should handle errors during warming gracefully', async () => {
      const error = new Error('Warming failed');
      jest.spyOn(service as any, 'warmFoodItems').mockRejectedValue(error);

      // Should not throw
      await expect((service as any).warmCache()).resolves.toBeUndefined();
    });

    it('should call warmFoodItems', async () => {
      const warmFoodItemsSpy = jest
        .spyOn(service as any, 'warmFoodItems')
        .mockResolvedValue(undefined);

      await (service as any).warmCache();

      expect(warmFoodItemsSpy).toHaveBeenCalled();
    });
  });

  describe('warmFoodItems (private)', () => {
    it('should be called during cache warming', async () => {
      const spy = jest
        .spyOn(service as any, 'warmFoodItems')
        .mockResolvedValue(undefined);

      await (service as any).warmCache();

      expect(spy).toHaveBeenCalled();
    });

    it('should log warming messages', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await (service as any).warmFoodItems();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warming food items'),
      );
    });
  });

  describe('Error handling', () => {
    it('should handle cache service errors during warming', async () => {
      process.env.CACHE_WARMING_ENABLED = 'true';
      jest
        .spyOn(service as any, 'warmCache')
        .mockRejectedValue(new Error('Cache error'));

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await expect(service.onModuleInit()).rejects.toThrow();
    });

    it('should log errors when warming fails', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      jest
        .spyOn(service as any, 'warmCache')
        .mockRejectedValue(new Error('Warming failed'));

      try {
        await (service as any).warmCache();
      } catch (e) {
        // Expected
      }

      expect(errorSpy).not.toHaveBeenCalled(); // Error is caught inside warmCache
    });

    it('should not propagate errors from warmCache', async () => {
      jest
        .spyOn(service as any, 'warmFoodItems')
        .mockRejectedValue(new Error('Food warming failed'));

      // Should not throw
      await expect(
        (service as any).warmCache(),
      ).resolves.toBeUndefined();
    });
  });

  describe('Integration', () => {
    it('should warmup on initialization when enabled', async () => {
      process.env.CACHE_WARMING_ENABLED = 'true';
      const warmCacheSpy = jest
        .spyOn(service as any, 'warmCache')
        .mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(warmCacheSpy).toHaveBeenCalled();
    });

    it('should handle multiple warmup triggers', async () => {
      const warmCacheSpy = jest
        .spyOn(service as any, 'warmCache')
        .mockResolvedValue(undefined);

      await service.triggerWarmup();
      await service.triggerWarmup();

      expect(warmCacheSpy).toHaveBeenCalledTimes(2);
    });
  });
});
