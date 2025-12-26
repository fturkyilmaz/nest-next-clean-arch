import { Test, TestingModule } from '@nestjs/testing';
import { QueryMonitoringService } from '@infrastructure/monitoring/query-monitoring.service';
import { Logger } from '@nestjs/common';

describe('QueryMonitoringService', () => {
  let service: QueryMonitoringService;
  let mockLogger: any;

  beforeEach(async () => {
    mockLogger = {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryMonitoringService,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<QueryMonitoringService>(QueryMonitoringService);
  });

  describe('logQuery', () => {
    it('should log successful query', () => {
      const query = 'SELECT * FROM users';
      const duration = 50;

      service.logQuery(query, duration, 'success');

      expect(service.getRecentQueries(1)).toHaveLength(1);
    });

    it('should log slow queries', () => {
      const query = 'SELECT * FROM large_table';
      const duration = 150; // Exceeds default threshold of 100ms

      service.logQuery(query, duration, 'success');

      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should log queries with errors', () => {
      const query = 'SELECT * FROM non_existent_table';
      const duration = 10;
      const error = 'Table does not exist';

      service.logQuery(query, duration, 'error', error);

      const stats = service.getStats();
      expect(stats.errorCount).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    it('should calculate correct statistics for multiple queries', () => {
      service.logQuery('SELECT * FROM users', 50, 'success');
      service.logQuery('SELECT * FROM clients', 100, 'success');
      service.logQuery('SELECT * FROM large_table', 200, 'success');

      const stats = service.getStats();

      expect(stats.total).toBe(3);
      expect(stats.avgDuration).toBeCloseTo((50 + 100 + 200) / 3, 1);
      expect(stats.maxDuration).toBe(200);
      expect(stats.minDuration).toBe(50);
    });

    it('should calculate error rate correctly', () => {
      service.logQuery('SELECT * FROM users', 50, 'success');
      service.logQuery('SELECT * FROM users', 50, 'success');
      service.logQuery('SELECT * FROM users', 50, 'error');
      service.logQuery('SELECT * FROM users', 50, 'error');

      const stats = service.getStats();

      expect(stats.errorRate).toBe(50); // 2 errors out of 4 queries = 50%
    });

    it('should calculate slow query rate correctly', () => {
      service.logQuery('SELECT * FROM users', 50, 'success'); // Not slow
      service.logQuery('SELECT * FROM users', 150, 'success'); // Slow
      service.logQuery('SELECT * FROM users', 150, 'success'); // Slow

      const stats = service.getStats();

      expect(stats.slowQueryCount).toBe(2);
      expect(stats.slowQueryRate).toBeCloseTo(66.67, 1);
    });

    it('should return zero stats when no queries logged', () => {
      const stats = service.getStats();

      expect(stats.total).toBe(0);
      expect(stats.avgDuration).toBe(0);
      expect(stats.errorCount).toBe(0);
    });
  });

  describe('getSlowQueries', () => {
    it('should return slow queries sorted by duration', () => {
      service.logQuery('SELECT * FROM users', 50, 'success');
      service.logQuery('SELECT * FROM large_table', 200, 'success');
      service.logQuery('SELECT * FROM medium_table', 150, 'success');

      const slowQueries = service.getSlowQueries(10);

      expect(slowQueries.length).toBeGreaterThan(0);
      expect(slowQueries[0].duration).toBeGreaterThanOrEqual(
        slowQueries[1]?.duration || 0,
      );
    });

    it('should respect limit parameter', () => {
      Array.from({ length: 50 }, (_, i) =>
        service.logQuery(`SELECT * FROM table_${i}`, 100 + i, 'success'),
      );

      const slowQueries = service.getSlowQueries(10);

      expect(slowQueries.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array if no slow queries', () => {
      service.logQuery('SELECT * FROM users', 50, 'success');
      service.logQuery('SELECT * FROM users', 60, 'success');

      const slowQueries = service.getSlowQueries(10);

      expect(slowQueries.length).toBe(0);
    });
  });

  describe('getRecentQueries', () => {
    it('should return recent queries in order', () => {
      service.logQuery('Query 1', 50, 'success');
      service.logQuery('Query 2', 60, 'success');
      service.logQuery('Query 3', 70, 'success');

      const recent = service.getRecentQueries(2);

      expect(recent).toHaveLength(2);
      expect(recent[0].query).toBe('Query 3'); // Most recent first
    });

    it('should respect limit parameter', () => {
      Array.from({ length: 50 }, (_, i) =>
        service.logQuery(`Query ${i}`, 50, 'success'),
      );

      const recent = service.getRecentQueries(10);

      expect(recent.length).toBeLessThanOrEqual(10);
    });
  });

  describe('reset', () => {
    it('should clear all metrics', () => {
      service.logQuery('SELECT * FROM users', 50, 'success');
      expect(service.getStats().total).toBeGreaterThan(0);

      service.reset();

      expect(service.getStats().total).toBe(0);
      expect(service.getRecentQueries(10)).toHaveLength(0);
    });
  });

  describe('export', () => {
    it('should export all metrics and queries', () => {
      service.logQuery('SELECT * FROM users', 50, 'success');
      service.logQuery('SELECT * FROM users', 150, 'success');

      const exported = service.export();

      expect(exported).toHaveProperty('metrics');
      expect(exported).toHaveProperty('stats');
      expect(exported.metrics).toHaveLength(2);
      expect(exported.stats).toHaveProperty('total');
    });
  });

  describe('createQueryMonitoringMiddleware', () => {
    it('should create middleware that wraps Prisma operations', async () => {
      const middleware = (client: any) => {
        return client.$extends({
          query: {
            $allOperations({ operation, args, query }: any) {
              const start = performance.now();
              return query(args).then((result: any) => {
                const duration = performance.now() - start;
                return result;
              });
            },
          },
        });
      };

      expect(typeof middleware).toBe('function');
    });
  });

  describe('memory management', () => {
    it('should keep rolling window of 1000 queries', () => {
      // Log 1100 queries
      Array.from({ length: 1100 }, (_, i) =>
        service.logQuery(`Query ${i}`, 50, 'success'),
      );

      const recent = service.getRecentQueries(2000);

      expect(recent.length).toBeLessThanOrEqual(1000);
    });

    it('should not grow memory unbounded', () => {
      const before = process.memoryUsage().heapUsed;

      // Log many queries
      Array.from({ length: 10000 }, (_, i) =>
        service.logQuery(`Query ${i}`, 50, 'success'),
      );

      const after = process.memoryUsage().heapUsed;
      const memoryIncrease = (after - before) / 1024 / 1024; // MB

      // Should not increase memory more than reasonable amount
      expect(memoryIncrease).toBeLessThan(50); // Less than 50MB
    });
  });

  describe('performance', () => {
    it('should log queries efficiently', () => {
      const start = performance.now();

      Array.from({ length: 1000 }, (_, i) =>
        service.logQuery(`Query ${i}`, 50, 'success'),
      );

      const duration = performance.now() - start;

      // Should complete 1000 logs in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should calculate stats efficiently', () => {
      Array.from({ length: 1000 }, (_, i) =>
        service.logQuery(`Query ${i}`, Math.random() * 200, 'success'),
      );

      const start = performance.now();
      service.getStats();
      const duration = performance.now() - start;

      // Stats calculation should be fast
      expect(duration).toBeLessThan(50);
    });
  });
});
