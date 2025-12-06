import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';

/**
 * Event Store for Domain Events
 * Provides audit trail and event sourcing capabilities
 */

export interface StoredEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventVersion: number;
  payload: string;
  metadata: string;
  occurredOn: Date;
  userId?: string;
}

@Injectable()
export class EventStore {
  private readonly logger = new Logger(EventStore.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append event to store
   */
  async append(
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    eventVersion: number,
    payload: any,
    metadata?: any,
    userId?: string
  ): Promise<void> {
    await this.prisma.eventStore.create({
      data: {
        aggregateId,
        aggregateType,
        eventType,
        version: eventVersion,
        eventData: JSON.stringify(payload),
        metaData: JSON.stringify({ ...(metadata || {}), userId }),
        timestamp: new Date(),
      },
    });

    this.logger.debug(
      `Event stored: ${eventType} for ${aggregateType}:${aggregateId}`
    );
  }

  /**
   * Get all events for an aggregate
   */
  async getEvents(aggregateId: string): Promise<StoredEvent[]> {
    const events = await this.prisma.eventStore.findMany({
      where: { aggregateId },
      orderBy: { timestamp: 'asc' },
    });
    return events.map(this.toStoredEvent);
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: string, limit: number = 100): Promise<StoredEvent[]> {
    const events = await this.prisma.eventStore.findMany({
      where: { eventType },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return events.map(this.toStoredEvent);
  }

  /**
   * Get events in time range
   */
  async getEventsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<StoredEvent[]> {
    const events = await this.prisma.eventStore.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });
    return events.map(this.toStoredEvent);
  }

  private toStoredEvent(model: any): StoredEvent {
    return {
      id: model.id,
      aggregateId: model.aggregateId,
      aggregateType: model.aggregateType,
      eventType: model.eventType,
      eventVersion: model.version,
      payload: model.eventData,
      metadata: model.metaData,
      occurredOn: model.timestamp,
    };
  }

  /**
   * Replay events for aggregate (Event Sourcing)
   */
  async replayEvents<T>(
    aggregateId: string,
    applyEvent: (event: StoredEvent) => void
  ): Promise<void> {
    const events = await this.getEvents(aggregateId);

    for (const event of events) {
      applyEvent(event);
    }
  }

  /**
   * Get aggregate version
   */
  async getAggregateVersion(aggregateId: string): Promise<number> {
    const lastEvent = await this.prisma.eventStore.findFirst({
      where: { aggregateId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    return lastEvent?.version || 0;
  }

  /**
   * Get event statistics
   */
  async getStatistics(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByAggregate: Record<string, number>;
  }> {
    const total = await this.prisma.eventStore.count();

    const byType = await this.prisma.eventStore.groupBy({
      by: ['eventType'],
      _count: true,
    });

    const byAggregate = await this.prisma.eventStore.groupBy({
      by: ['aggregateType'],
      _count: true,
    });

    return {
      totalEvents: total,
      eventsByType: Object.fromEntries(
        byType.map((item) => [item.eventType, item._count])
      ),
      eventsByAggregate: Object.fromEntries(
        byAggregate.map((item) => [item.aggregateType, item._count])
      ),
    };
  }
}

/**
 * Usage:
 * 
 * // Store event
 * await eventStore.append(
 *   user.id,
 *   'User',
 *   'UserCreated',
 *   1,
 *   { email: user.email, role: user.role },
 *   { ipAddress: req.ip },
 *   currentUser.id
 * );
 * 
 * // Replay events (Event Sourcing)
 * const user = new User();
 * await eventStore.replayEvents(userId, (event) => {
 *   user.apply(event);
 * });
 */
