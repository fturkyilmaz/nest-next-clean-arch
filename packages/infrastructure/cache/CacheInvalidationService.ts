import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisCacheService } from './RedisCacheService';

/**
 * Service to invalidate cache when data changes
 */
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(private cacheService: RedisCacheService) {}

  /**
   * Invalidate user-related caches
   */
  async invalidateUser(userId: string): Promise<void> {
    this.logger.log(`Invalidating cache for user: ${userId}`);
    
    await this.cacheService.del(this.cacheService.getUserCacheKey(userId));
    await this.cacheService.delPattern('users:list:*');
  }

  /**
   * Invalidate client-related caches
   */
  async invalidateClient(clientId: string, dietitianId?: string): Promise<void> {
    this.logger.log(`Invalidating cache for client: ${clientId}`);
    
    await this.cacheService.del(this.cacheService.getClientCacheKey(clientId));
    
    if (dietitianId) {
      await this.cacheService.delPattern(`clients:list:${dietitianId}:*`);
    }
    
    await this.cacheService.delPattern('clients:list:all:*');
  }

  /**
   * Invalidate diet plan-related caches
   */
  async invalidateDietPlan(dietPlanId: string, clientId: string): Promise<void> {
    this.logger.log(`Invalidating cache for diet plan: ${dietPlanId}`);
    
    await this.cacheService.del(this.cacheService.getDietPlanCacheKey(dietPlanId));
    await this.cacheService.delPattern(`dietplans:client:${clientId}:*`);
  }

  /**
   * Invalidate food item-related caches
   */
  async invalidateFoodItem(foodItemId: string): Promise<void> {
    this.logger.log(`Invalidating cache for food item: ${foodItemId}`);
    
    await this.cacheService.del(this.cacheService.getFoodItemCacheKey(foodItemId));
    await this.cacheService.delPattern('fooditems:list:*');
  }

  /**
   * Clear all caches (use with caution)
   */
  async clearAll(): Promise<void> {
    this.logger.warn('Clearing all caches');
    await this.cacheService.reset();
  }
}
