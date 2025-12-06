import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface CacheService {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<void>;
  reset(): Promise<void>;
}

@Injectable()
export class RedisCacheService implements CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    // This requires redis store with pattern support
    const store = (this.cacheManager as any).store;
    if (store.keys) {
      const keys = await store.keys(pattern);
      for (const key of keys) {
        await this.del(key);
      }
    } else if (typeof store.keys === 'function') {
        const keys = await store.keys();
        const matchingKeys = keys.filter((key: string) => 
          new RegExp(pattern.replace('*', '.*')).test(key)
        );
        for (const key of matchingKeys) {
          await this.del(key);
        }
    }
  }

  async reset(): Promise<void> {
    const manager = this.cacheManager as any;
    if (manager.store && manager.store.reset) {
      await manager.store.reset();
    } else if (manager.reset) {
      await manager.reset();
    }
  }

  // Helper methods for common cache keys
  getUserCacheKey(userId: string): string {
    return `user:${userId}`;
  }

  getClientCacheKey(clientId: string): string {
    return `client:${clientId}`;
  }

  getDietPlanCacheKey(dietPlanId: string): string {
    return `dietplan:${dietPlanId}`;
  }

  getFoodItemCacheKey(foodItemId: string): string {
    return `fooditem:${foodItemId}`;
  }

  getUserListCacheKey(filters?: any): string {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    return `users:list:${filterStr}`;
  }

  getClientListCacheKey(dietitianId?: string, filters?: any): string {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    return `clients:list:${dietitianId || 'all'}:${filterStr}`;
  }
}
