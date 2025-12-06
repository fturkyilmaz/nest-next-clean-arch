import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';

/**
 * Service for optimized bulk operations
 */
@Injectable()
export class BulkOperationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Bulk create food items
   */
  async createFoodItems(items: any[]) {
    // Use createMany for better performance
    return this.prisma.foodItem.createMany({
      data: items,
      skipDuplicates: true,
    });
  }

  /**
   * Bulk update client metrics
   */
  async updateClientMetrics(updates: Array<{ id: string; data: any }>) {
    return this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.clientMetrics.update({
          where: { id: update.id },
          data: update.data,
        })
      )
    );
  }

  /**
   * Bulk soft delete
   */
  async softDeleteMany(model: 'user' | 'client' | 'dietPlan', ids: string[]) {
    return (this.prisma[model] as any).updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Batch process with chunking to avoid memory issues
   */
  async batchProcess<T, R>(
    items: T[],
    processor: (chunk: T[]) => Promise<R[]>,
    chunkSize: number = 100
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const chunkResults = await processor(chunk);
      results.push(...chunkResults);
    }

    return results;
  }
}
