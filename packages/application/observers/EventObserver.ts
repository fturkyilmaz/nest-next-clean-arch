/**
 * Observer Pattern - Event Subscribers
 * Implements publish-subscribe for domain events
 */

import { Injectable } from '@nestjs/common';

/**
 * Observer Interface
 */
export interface IObserver<T> {
  update(data: T): Promise<void>;
}

/**
 * Subject Interface
 */
export interface ISubject<T> {
  attach(observer: IObserver<T>): void;
  detach(observer: IObserver<T>): void;
  notify(data: T): Promise<void>;
}

/**
 * Event Publisher (Subject)
 */
@Injectable()
export class EventPublisher<T> implements ISubject<T> {
  private observers: IObserver<T>[] = [];

  attach(observer: IObserver<T>): void {
    const exists = this.observers.includes(observer);
    if (!exists) {
      this.observers.push(observer);
    }
  }

  detach(observer: IObserver<T>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  async notify(data: T): Promise<void> {
    await Promise.all(
      this.observers.map((observer) => observer.update(data))
    );
  }
}

/**
 * Example: Client Metrics Event
 */
export interface ClientMetricsEvent {
  clientId: string;
  weight: number;
  height: number;
  bmi: number;
  recordedAt: Date;
}

/**
 * Email Notification Observer
 */
export class EmailNotificationObserver implements IObserver<ClientMetricsEvent> {
  async update(data: ClientMetricsEvent): Promise<void> {
    console.log(`Sending email notification for client ${data.clientId}`);
    // Send email logic
  }
}

/**
 * Analytics Observer
 */
export class AnalyticsObserver implements IObserver<ClientMetricsEvent> {
  async update(data: ClientMetricsEvent): Promise<void> {
    console.log(`Recording analytics for client ${data.clientId}`);
    // Track in analytics system
  }
}

/**
 * Cache Invalidation Observer
 */
export class CacheInvalidationObserver implements IObserver<ClientMetricsEvent> {
  async update(data: ClientMetricsEvent): Promise<void> {
    console.log(`Invalidating cache for client ${data.clientId}`);
    // Invalidate cache
  }
}

/**
 * Dashboard Update Observer
 */
export class DashboardUpdateObserver implements IObserver<ClientMetricsEvent> {
  async update(data: ClientMetricsEvent): Promise<void> {
    console.log(`Updating dashboard for client ${data.clientId}`);
    // Update real-time dashboard
  }
}

/**
 * Usage:
 * 
 * const metricsPublisher = new EventPublisher<ClientMetricsEvent>();
 * 
 * // Attach observers
 * metricsPublisher.attach(new EmailNotificationObserver());
 * metricsPublisher.attach(new AnalyticsObserver());
 * metricsPublisher.attach(new CacheInvalidationObserver());
 * metricsPublisher.attach(new DashboardUpdateObserver());
 * 
 * // Publish event
 * await metricsPublisher.notify({
 *   clientId: '123',
 *   weight: 75,
 *   height: 175,
 *   bmi: 24.5,
 *   recordedAt: new Date(),
 * });
 */
