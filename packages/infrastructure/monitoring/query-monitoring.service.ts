/**
 * Query Monitoring & Performance Logging
 *
 * Tracks database query performance and identifies slow queries.
 */

import { Injectable, Logger } from '@nestjs/common';

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  status: 'success' | 'error';
  error?: string;
}

@Injectable()
export class QueryMonitoringService {
  private logger = new Logger('QueryMonitoring');
  private queryMetrics: QueryMetrics[] = [];
  private slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD || '100'); // ms

  /**
   * Log query execution
   */
  logQuery(
    query: string,
    duration: number,
    status: 'success' | 'error' = 'success',
    error?: string,
  ): void {
    const metric: QueryMetrics = {
      query,
      duration,
      timestamp: new Date(),
      status,
      error,
    };

    this.queryMetrics.push(metric);

    // Keep only last 1000 queries in memory
    if (this.queryMetrics.length > 1000) {
      this.queryMetrics = this.queryMetrics.slice(-1000);
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      this.logger.warn(
        `SLOW QUERY (${duration}ms): ${query}${error ? ` - ERROR: ${error}` : ''}`,
      );
    }

    // Log errors
    if (status === 'error') {
      this.logger.error(
        `QUERY ERROR (${duration}ms): ${query} - ${error}`,
      );
    }
  }

  /**
   * Get query statistics
   */
  getStats() {
    if (this.queryMetrics.length === 0) {
      return null;
    }

    const total = this.queryMetrics.length;
    const avgDuration =
      this.queryMetrics.reduce((sum, m) => sum + m.duration, 0) / total;
    const maxDuration = Math.max(...this.queryMetrics.map((m) => m.duration));
    const minDuration = Math.min(...this.queryMetrics.map((m) => m.duration));
    const errorCount = this.queryMetrics.filter((m) => m.status === 'error').length;
    const slowQueryCount = this.queryMetrics.filter(
      (m) => m.duration > this.slowQueryThreshold,
    ).length;

    return {
      total,
      avgDuration: avgDuration.toFixed(2),
      maxDuration,
      minDuration,
      errorCount,
      slowQueryCount,
      errorRate: ((errorCount / total) * 100).toFixed(2) + '%',
      slowQueryRate: ((slowQueryCount / total) * 100).toFixed(2) + '%',
    };
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit = 10): QueryMetrics[] {
    return this.queryMetrics
      .filter((m) => m.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get recent queries
   */
  getRecentQueries(limit = 20): QueryMetrics[] {
    return this.queryMetrics.slice(-limit);
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.queryMetrics = [];
  }

  /**
   * Export metrics for analysis
   */
  export() {
    return {
      metrics: this.queryMetrics,
      stats: this.getStats(),
    };
  }
}

/**
 * Middleware to wrap Prisma queries with monitoring
 */
export function createQueryMonitoringMiddleware(
  monitoringService: QueryMonitoringService,
) {
  return {
    name: 'queryMonitoring',
    query: {
      async $allOperations({ operation, model, args, query }: any) {
        const startTime = Date.now();

        try {
          const result = await query(args);
          const duration = Date.now() - startTime;

          monitoringService.logQuery(
            `${model}.${operation}`,
            duration,
            'success',
          );

          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : String(error);

          monitoringService.logQuery(
            `${model}.${operation}`,
            duration,
            'error',
            errorMessage,
          );

          throw error;
        }
      },
    },
  };
}
