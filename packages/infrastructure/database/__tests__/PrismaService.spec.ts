import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../PrismaService';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    // Mock PrismaClient
    const mockPrismaClient = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $transaction: jest.fn(),
      $on: jest.fn(),
      user: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      client: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    // Create instance with mocked parent
    service = Object.create(PrismaService.prototype);
    Object.assign(service, mockPrismaClient);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect to database', async () => {
      service.$connect = jest.fn();

      await service.onModuleInit();

      expect(service.$connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database', async () => {
      service.$disconnect = jest.fn();

      await service.onModuleDestroy();

      expect(service.$disconnect).toHaveBeenCalled();
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple records in transaction', async () => {
      const data = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];
      const results = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];

      service.$transaction = jest.fn().mockResolvedValue(results);
      service.user = { create: jest.fn() };

      const result = await service.bulkCreate('user', data);

      expect(service.$transaction).toHaveBeenCalled();
      expect(result).toEqual(results);
    });

    it('should execute create for each item', async () => {
      const data = [{ name: 'User 1' }, { name: 'User 2' }];
      const results = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];

      service.$transaction = jest.fn().mockResolvedValue(results);
      service.user = { create: jest.fn() };

      await service.bulkCreate('user', data);

      expect(service.$transaction).toHaveBeenCalledWith(expect.any(Array));
      const calls = service.$transaction.mock.calls[0][0];
      expect(calls).toHaveLength(2);
    });

    it('should return empty array for empty input', async () => {
      service.$transaction = jest.fn().mockResolvedValue([]);

      const result = await service.bulkCreate('user', []);

      expect(result).toEqual([]);
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple records in transaction', async () => {
      const updates = [
        { where: { id: '1' }, data: { name: 'Updated 1' } },
        { where: { id: '2' }, data: { name: 'Updated 2' } },
      ];
      const results = [
        { id: '1', name: 'Updated 1' },
        { id: '2', name: 'Updated 2' },
      ];

      service.$transaction = jest.fn().mockResolvedValue(results);
      service.user = { update: jest.fn() };

      const result = await service.bulkUpdate('user', updates);

      expect(service.$transaction).toHaveBeenCalled();
      expect(result).toEqual(results);
    });

    it('should execute update for each item', async () => {
      const updates = [
        { where: { id: '1' }, data: { name: 'Updated 1' } },
        { where: { id: '2' }, data: { name: 'Updated 2' } },
      ];

      service.$transaction = jest.fn().mockResolvedValue([]);

      await service.bulkUpdate('user', updates);

      expect(service.$transaction).toHaveBeenCalled();
      const calls = service.$transaction.mock.calls[0][0];
      expect(calls).toHaveLength(2);
    });

    it('should handle empty updates', async () => {
      service.$transaction = jest.fn().mockResolvedValue([]);

      const result = await service.bulkUpdate('user', []);

      expect(result).toEqual([]);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple records by IDs', async () => {
      const ids = ['1', '2', '3'];

      service.user = {
        deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
      };

      const result = await service.bulkDelete('user', ids);

      expect(result).toBe(3);
      expect(service.user.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
      });
    });

    it('should handle empty ID array', async () => {
      service.user = {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      };

      const result = await service.bulkDelete('user', []);

      expect(result).toBe(0);
    });

    it('should return count of deleted records', async () => {
      service.user = {
        deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
      };

      const result = await service.bulkDelete('user', ['1', '2', '3', '4', '5']);

      expect(result).toBe(5);
    });

    it('should delete from correct model', async () => {
      service.client = {
        deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      };

      await service.bulkDelete('client', ['1', '2']);

      expect(service.client.deleteMany).toHaveBeenCalled();
    });
  });

  describe('withRetry', () => {
    it('should return result on first successful attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await service.withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');

      const result = await service.withRetry(operation, 3, 10);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exceeded', async () => {
      const error = new Error('Persistent failure');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(service.withRetry(operation, 2, 10)).rejects.toThrow(
        'Persistent failure',
      );

      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should use default maxRetries of 3', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Fail'));

      await expect(service.withRetry(operation)).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should use default delay of 1000ms', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      await service.withRetry(operation, 2, 1000);
      const elapsed = Date.now() - startTime;

      // Should have at least one delay of 1000ms
      expect(elapsed).toBeGreaterThanOrEqual(1000);
    });

    it('should increase delay between retries', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'));

      const startTime = Date.now();
      await expect(service.withRetry(operation, 3, 50)).rejects.toThrow();
      const elapsed = Date.now() - startTime;

      // Total delay: 50*(0+1) + 50*(1+1) = 50 + 100 = 150ms minimum
      expect(elapsed).toBeGreaterThanOrEqual(150);
    });

    it('should not retry on successful operation', async () => {
      const operation = jest.fn().mockResolvedValue('immediate-success');

      const result = await service.withRetry(operation, 5, 100);

      expect(result).toBe('immediate-success');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
});
