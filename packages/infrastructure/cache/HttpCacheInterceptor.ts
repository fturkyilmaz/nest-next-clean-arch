import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RedisCacheService } from './RedisCacheService';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

/**
 * Custom cache interceptor with support for dynamic cache keys
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    private cacheService: RedisCacheService,
    private reflector: Reflector
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler()
    );

    if (!cacheKey) {
      return next.handle();
    }

    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler()
    );

    const request = context.switchToHttp().getRequest();
    const key = this.generateCacheKey(cacheKey, request);

    // Try to get from cache
    const cachedResponse = await this.cacheService.get(key);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // If not in cache, execute handler and cache result
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheService.set(key, response, ttl);
      })
    );
  }

  private generateCacheKey(template: string, request: any): string {
    let key = template;

    // Replace placeholders with actual values
    // e.g., "user:{userId}" -> "user:123"
    const matches = template.match(/\{([^}]+)\}/g);
    if (matches) {
      matches.forEach((match) => {
        const param = match.slice(1, -1); // Remove { }
        const value = request.params[param] || request.query[param] || request.user?.[param];
        key = key.replace(match, value || '');
      });
    }

    return key;
  }
}
