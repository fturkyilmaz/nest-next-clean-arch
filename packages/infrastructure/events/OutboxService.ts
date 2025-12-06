import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';

/**
 * Outbox Pattern Implementation
 * Ensures reliable event publishing with transactional guarantees
 */

export interface OutboxEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: string;
  occurredOn: Date;
  processedAt?: Date;
  retryCount: number;
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save event to outbox in same transaction as aggregate
   */
  async saveEvent(
    tx: any,
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    await tx.outboxEvent.create({
      data: {
        aggregateId,
        aggregateType,
        eventType,
        payload: JSON.stringify(payload),
        createdAt: new Date(),
        retryCount: 0,
      },
    });
  }

  /**
   * Get unprocessed events
   */
  async getUnprocessedEvents(limit: number = 100): Promise<OutboxEvent[]> {
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        processedAt: null,
        retryCount: { lt: 3 }, // Max 3 retries
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });
    return events.map((e: any) => ({
      ...e,
      occurredOn: e.createdAt, // Map DTO property
    }));
  }

  /**
   * Mark event as processed
   */
  async markAsProcessed(eventId: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id: eventId },
      data: { processedAt: new Date() },
    });
  }

  /**
   * Increment retry count
   */
  async incrementRetry(eventId: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id: eventId },
      data: { retryCount: { increment: 1 } },
    });
  }

  /**
   * Process outbox events (run by background job)
   */
  async processEvents(): Promise<void> {
    const events = await this.getUnprocessedEvents();

    for (const event of events) {
      try {
        // Publish event to event bus
        await this.publishEvent(event);
        await this.markAsProcessed(event.id);
        this.logger.log(`Processed outbox event: ${event.id}`);
      } catch (error) {
        this.logger.error(`Failed to process event ${event.id}`, error);
        await this.incrementRetry(event.id);
      }
    }
  }

  private async publishEvent(event: OutboxEvent): Promise<void> {
    // Publish to event bus (EventEmitter2, RabbitMQ, etc.)
    // Implementation depends on your event bus
    this.logger.debug(`Publishing event: ${event.eventType}`);
  }
}

/**
 * Usage in Command Handler:
 * 
 * await this.unitOfWork.execute(async (tx) => {
 *   const user = await tx.user.create({ data: userData });
 *   
 *   // Save event to outbox in same transaction
 *   await this.outboxService.saveEvent(
 *     tx,
 *     user.id,
 *     'User',
 *     'UserCreated',
 *     { userId: user.id, email: user.email }
 *   );
 *   
 *   return user;
 * });
 */
