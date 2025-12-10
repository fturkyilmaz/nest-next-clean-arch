import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { adapter } from '../../../prisma/lib/prisma';

/**
 * Prisma Service with PostgreSQL adapter and extra helpers
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
 
    super({
      adapter,
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });

    // Development ortamında yavaş query loglama
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e: any) => {
        if (e.duration > 1000) {
          console.warn(`🐢 Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
    console.log('PostgreSQL connected via Prisma adapter');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Bulk create with transaction
   */
  async bulkCreate<T>(model: string, data: any[]): Promise<T[]> {
    return this.$transaction(
      data.map((item) => (this as any)[model].create({ data: item }))
    );
  }

  /**
   * Bulk update with transaction
   */
  async bulkUpdate<T>(model: string, updates: Array<{ where: any; data: any }>): Promise<T[]> {
    return this.$transaction(
      updates.map((update) => (this as any)[model].update(update))
    );
  }

  /**
   * Bulk delete with transaction
   */
  async bulkDelete(model: string, ids: string[]): Promise<number> {
    const result = await (this as any)[model].deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  /**
   * Execute query with retry logic
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw lastError!;
  }
}
