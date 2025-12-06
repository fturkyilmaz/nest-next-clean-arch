import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';

/**
 * Unit of Work pattern for managing transactions
 * Ensures atomic operations across multiple repositories
 */
@Injectable()
export class UnitOfWork {
  private readonly logger = new Logger(UnitOfWork.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute operations within a transaction
   * Automatically commits on success, rolls back on error
   */
  async execute<T>(work: (prisma: PrismaService) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      this.logger.debug('Transaction started');
      
      try {
        const result = await work(tx as PrismaService);
        this.logger.debug('Transaction committed');
        return result;
      } catch (error) {
        this.logger.error('Transaction rolled back', error);
        throw error;
      }
    });
  }

  /**
   * Execute with retry logic
   */
  async executeWithRetry<T>(
    work: (prisma: PrismaService) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(work);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Transaction attempt ${attempt} failed`, error);

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Execute with isolation level
   */
  async executeWithIsolation<T>(
    work: (prisma: PrismaService) => Promise<T>,
    isolationLevel: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable'
  ): Promise<T> {
    return this.prisma.$transaction(
      async (tx) => {
        return await work(tx as PrismaService);
      },
      {
        isolationLevel,
        maxWait: 5000,
        timeout: 10000,
      }
    );
  }
}

/**
 * Usage example:
 * 
 * await this.unitOfWork.execute(async (tx) => {
 *   const user = await tx.user.create({ data: userData });
 *   const client = await tx.client.create({ data: { ...clientData, userId: user.id } });
 *   await tx.auditLog.create({ data: { action: 'USER_CREATED', userId: user.id } });
 *   return { user, client };
 * });
 */
