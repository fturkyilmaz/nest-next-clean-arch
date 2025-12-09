import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import { RedisCacheService } from './RedisCacheService';
import { CacheInvalidationService } from './CacheInvalidationService';
import { CacheWarmingService } from './CacheWarmingService';
import { HttpCacheInterceptor } from './HttpCacheInterceptor';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST') || 'localhost',
        port: configService.get('REDIS_PORT') || 6379,
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB') || 0,
        ttl: 60 * 5, // 5 minutes default TTL
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [
    Reflector,
    RedisCacheService,
    CacheInvalidationService,
    CacheWarmingService,
    HttpCacheInterceptor,
  ],
  exports: [
    CacheModule,
    RedisCacheService,
    CacheInvalidationService,
    CacheWarmingService,
    HttpCacheInterceptor,
  ],
})
export class RedisCacheModule { }

