import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisCacheService } from './RedisCacheService';
import { Inject } from '@nestjs/common';

/**
 * Service to warm up cache with critical data on application startup
 */
@Injectable()
export class CacheWarmingService implements OnModuleInit {
  private readonly logger = new Logger(CacheWarmingService.name);

  constructor(
    private cacheService: RedisCacheService,
    // Inject repositories when needed
    // @Inject('IFoodItemRepository') private foodItemRepository: IFoodItemRepository,
  ) {}

  async onModuleInit() {
    if (process.env.CACHE_WARMING_ENABLED === 'true') {
      this.logger.log('Starting cache warming...');
      await this.warmCache();
      this.logger.log('Cache warming completed');
    }
  }

  private async warmCache(): Promise<void> {
    try {
      // Warm up food items cache (most frequently accessed)
      await this.warmFoodItems();

      // Add more warming strategies as needed
      // await this.warmDietPlanTemplates();
      // await this.warmPopularDietPlans();
    } catch (error) {
      this.logger.error('Error during cache warming', error);
    }
  }

  private async warmFoodItems(): Promise<void> {
    this.logger.log('Warming food items cache...');
    
    // TODO: Fetch all active food items and cache them
    // const foodItems = await this.foodItemRepository.findAll({ isActive: true });
    // 
    // for (const item of foodItems) {
    //   const key = this.cacheService.getFoodItemCacheKey(item.getId());
    //   await this.cacheService.set(key, item, 3600); // 1 hour TTL
    // }
    
    this.logger.log('Food items cache warmed');
  }

  /**
   * Manually trigger cache warming (useful for admin endpoints)
   */
  async triggerWarmup(): Promise<void> {
    this.logger.log('Manual cache warming triggered');
    await this.warmCache();
  }
}
