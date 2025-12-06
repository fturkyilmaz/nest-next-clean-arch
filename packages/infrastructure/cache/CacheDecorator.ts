import { SetMetadata } from '@nestjs/common';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from './HttpCacheInterceptor';

/**
 * Decorator to enable caching for a route handler
 * @param cacheKey - Cache key template (e.g., "user:{userId}")
 * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
export const CacheResponse = (cacheKey: string, ttl: number = 300) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, cacheKey)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
    return descriptor;
  };
};
