import { PrismaRepositoryBase } from '../PrismaRepositoryBase';
import { PrismaService } from '@infrastructure/database/PrismaService';

// Concrete implementation for testing
class TestRepository extends PrismaRepositoryBase<any, any, string> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  protected toDomain(model: any): any {
    return model;
  }

  protected toPrisma(domain: any): Partial<any> {
    return domain;
  }
}

describe('PrismaRepositoryBase', () => {
  let repository: TestRepository;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    repository = new TestRepository(mockPrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toPrismaOrderBy', () => {
    it('should return undefined for no orderBy', () => {
      const result = (repository as any).toPrismaOrderBy(undefined);
      expect(result).toBeUndefined();
    });

    it('should parse orderBy with field and direction', () => {
      const result = (repository as any).toPrismaOrderBy('createdAt:desc');
      expect(result).toEqual({ createdAt: 'desc' });
    });

    it('should default to asc if no direction specified', () => {
      const result = (repository as any).toPrismaOrderBy('name');
      expect(result).toEqual({ name: 'asc' });
    });

    it('should handle various field names', () => {
      const result = (repository as any).toPrismaOrderBy('email:asc');
      expect(result).toEqual({ email: 'asc' });
    });
  });

  describe('toPrismaInclude', () => {
    it('should return undefined for empty includes', () => {
      const result = (repository as any).toPrismaInclude([]);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined includes', () => {
      const result = (repository as any).toPrismaInclude(undefined);
      expect(result).toBeUndefined();
    });

    it('should convert includes array to object', () => {
      const result = (repository as any).toPrismaInclude(['profile', 'posts']);
      expect(result).toEqual({ profile: true, posts: true });
    });

    it('should handle single include', () => {
      const result = (repository as any).toPrismaInclude(['profile']);
      expect(result).toEqual({ profile: true });
    });
  });

  describe('findById', () => {
    it('should find entity by ID and return domain entity', async () => {
      const mockEntity = { id: '1', name: 'Test' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockEntity);

      const result = await repository.findById('1');

      expect(result).toEqual(mockEntity);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if entity not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all entities', async () => {
      const mockEntities = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(mockEntities);

      const result = await repository.findAll();

      expect(result).toEqual(mockEntities);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({});
    });

    it('should return empty array if no entities found', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and return domain entity', async () => {
      const entity = { name: 'New User', email: 'test@example.com' };
      const createdEntity = { id: '1', ...entity };

      mockPrismaService.user.create.mockResolvedValue(createdEntity);

      const result = await repository.create(entity);

      expect(result).toEqual(createdEntity);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: entity,
      });
    });

    it('should call toPrisma before creating', async () => {
      const entity = { name: 'Test' };
      jest.spyOn(repository as any, 'toPrisma').mockReturnValue(entity);

      mockPrismaService.user.create.mockResolvedValue({ id: '1', ...entity });

      await repository.create(entity);

      expect((repository as any).toPrisma).toHaveBeenCalledWith(entity);
    });
  });

  describe('update', () => {
    it('should update and return domain entity', async () => {
      const entity = { name: 'Updated User' };
      const updatedEntity = { id: '1', ...entity };

      mockPrismaService.user.update.mockResolvedValue(updatedEntity);

      const result = await repository.update('1', entity);

      expect(result).toEqual(updatedEntity);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: entity,
      });
    });

    it('should return null if update fails', async () => {
      mockPrismaService.user.update.mockResolvedValue(null);

      const result = await repository.update('non-existent', {});

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete entity and return true', async () => {
      mockPrismaService.user.delete.mockResolvedValue({ id: '1' });

      const result = await repository.delete('1');

      expect(result).toBe(true);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return false if delete fails', async () => {
      mockPrismaService.user.delete.mockRejectedValue(new Error('Not found'));

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('findBySpecification', () => {
    it('should find entities by specification', async () => {
      const mockSpec: any = {
        toPrismaWhere: jest.fn().mockReturnValue({ status: 'ACTIVE' }),
      };
      const mockEntities = [{ id: '1', status: 'ACTIVE' }];

      mockPrismaService.user.findMany.mockResolvedValue(mockEntities);

      const result = await repository.findBySpecification(mockSpec);

      expect(result).toEqual(mockEntities);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
      });
    });

    it('should handle specification without toPrismaWhere', async () => {
      const mockSpec: any = {};

      mockPrismaService.user.findMany.mockResolvedValue([]);

      await repository.findBySpecification(mockSpec);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
      });
    });
  });

  describe('countBySpecification', () => {
    it('should count entities by specification', async () => {
      const mockSpec: any = {
        toPrismaWhere: jest.fn().mockReturnValue({ status: 'ACTIVE' }),
      };

      mockPrismaService.user.count.mockResolvedValue(5);

      const result = await repository.countBySpecification(mockSpec);

      expect(result).toBe(5);
      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
      });
    });
  });

  describe('findAndPaginate', () => {
    it('should find and paginate entities', async () => {
      const mockSpec: any = {
        toPrismaWhere: jest.fn().mockReturnValue({ status: 'ACTIVE' }),
      };
      const mockEntities = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockEntities);
      mockPrismaService.user.count.mockResolvedValue(5);

      const result = await repository.findAndPaginate(mockSpec, 1, 2);

      expect(result).toEqual({
        data: mockEntities,
        total: 5,
        page: 1,
        limit: 2,
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        skip: 0,
        take: 2,
        orderBy: undefined,
      });
    });

    it('should calculate skip correctly', async () => {
      const mockSpec: any = {
        toPrismaWhere: jest.fn().mockReturnValue({}),
      };

      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(10);

      await repository.findAndPaginate(mockSpec, 3, 5);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (3-1) * 5
        }),
      );
    });

    it('should apply orderBy when provided', async () => {
      const mockSpec: any = {
        toPrismaWhere: jest.fn().mockReturnValue({}),
      };

      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      await repository.findAndPaginate(mockSpec, 1, 10, 'createdAt:desc');

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('model getter', () => {
    it('should return the prisma model delegate', () => {
      const model = (repository as any).model;

      expect(model).toBe(mockPrismaService.user);
    });
  });

  describe('toPrismaWhere', () => {
    it('should call toPrismaWhere on specification if available', () => {
      const mockSpec: any = {
        toPrismaWhere: jest.fn().mockReturnValue({ id: '1' }),
      };

      const result = (repository as any).toPrismaWhere(mockSpec);

      expect(result).toEqual({ id: '1' });
      expect(mockSpec.toPrismaWhere).toHaveBeenCalled();
    });

    it('should return empty object if toPrismaWhere not available', () => {
      const mockSpec: any = {};

      const result = (repository as any).toPrismaWhere(mockSpec);

      expect(result).toEqual({});
    });
  });
});
