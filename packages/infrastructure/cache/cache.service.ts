/**
 * Cache Service - Redis Integration
 *
 * Implements caching strategy for frequently accessed data
 * using Redis with configurable TTLs.
 */

import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key: string;
}

@Injectable()
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected');
    });
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached value
   */
  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete by pattern (e.g., user:123:*)
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Invalidate user-related caches
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.deletePattern(`user:${userId}:*`);
  }

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    getter: () => Promise<T>,
    ttl = 3600,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Get from source
    const value = await getter();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Cache middleware for frequently accessed data
   */
  cacheMiddleware(
    keyPattern: (req: any) => string,
    ttl = 3600,
  ) {
    return async (req: any, res: any, next: any) => {
      const key = keyPattern(req);

      // Try cache first
      const cached = await this.get(key);
      if (cached) {
        return res.json(cached);
      }

      // Override res.json to cache response
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        this.set(key, data, ttl).catch((error) => {
          console.error('Failed to cache response:', error);
        });
        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Cache invalidation for entity updates
   */
  async invalidateEntityCache(entityType: string, entityId: string, userId?: string): Promise<void> {
    // Invalidate specific entity cache
    await this.delete(`${entityType}:${entityId}`);

    // Invalidate list caches if user provided
    if (userId) {
      await this.deletePattern(`user:${userId}:${entityType}:*`);
      await this.deletePattern(`user:${userId}:dashboard:*`);
    }
  }

  /**
   * Warm up cache for commonly accessed data
   */
  async warmCache(userId: string, getter: (userId: string) => Promise<any>): Promise<void> {
    try {
      const data = await getter(userId);
      await this.set(`user:${userId}:dashboard`, data, 3600);
    } catch (error) {
      console.error(`Failed to warm cache for user ${userId}:`, error);
    }
  }

  /**
   * Get cache stats
   */
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info('stats');
      return info;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  }

  /**
   * Health check
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }

  // Cache key builders
  static keys = {
    user: (userId: string) => `user:${userId}`,
    userDashboard: (userId: string) => `user:${userId}:dashboard`,
    userDietPlans: (userId: string) => `user:${userId}:diet-plans`,
    userMeals: (userId: string, dietPlanId?: string) =>
      `user:${userId}:meals${dietPlanId ? `:${dietPlanId}` : ''}`,
    userMetrics: (userId: string, days = 30) => `user:${userId}:metrics:${days}d`,
    userFoods: (userId: string, category?: string) =>
      `user:${userId}:foods${category ? `:${category}` : ''}`,
    dietPlan: (planId: string) => `diet-plan:${planId}`,
    meal: (mealId: string) => `meal:${mealId}`,
    food: (foodId: string) => `food:${foodId}`,
    metric: (metricId: string) => `metric:${metricId}`,
  };

  // Default TTLs
  static ttl = {
    short: 300, // 5 minutes
    medium: 3600, // 1 hour
    long: 86400, // 24 hours
    veryLong: 604800, // 7 days
  };
}
