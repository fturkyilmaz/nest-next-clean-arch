import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';
import {
  IAdvancedRepository,
  PaginatedResult,
  QueryOptions,
} from '@application/interfaces/repositories/IRepositorySpecification';
import { Specification } from '@domain/specifications/Specification';

/**
 * Generic Prisma Repository Base Class
 * Implements specification pattern with Prisma
 */
@Injectable()
export abstract class PrismaRepositoryBase<T, TDomain, ID = string>
  implements IAdvancedRepository<TDomain, ID>
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string
  ) {}

  /**
   * Get Prisma model delegate
   */
  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Convert specification to Prisma where clause
   */
  protected toPrismaWhere(spec: Specification<TDomain>): any {
    if ('toPrismaWhere' in spec && typeof spec.toPrismaWhere === 'function') {
      return (spec as any).toPrismaWhere();
    }
    return {};
  }

  /**
   * Convert Prisma model to domain entity
   */
  protected abstract toDomain(model: T): TDomain;

  /**
   * Convert domain entity to Prisma model
   */
  protected abstract toPrisma(domain: TDomain): Partial<T>;

  /**
   * Find entities matching specification
   */
  async find(spec: Specification<TDomain>): Promise<TDomain[]> {
    const where = this.toPrismaWhere(spec);
    const models = await this.model.findMany({ where });
    return models.map((m: T) => this.toDomain(m));
  }

  /**
   * Find single entity matching specification
   */
  async findOne(spec: Specification<TDomain>): Promise<TDomain | null> {
    const where = this.toPrismaWhere(spec);
    const model = await this.model.findFirst({ where });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Count entities matching specification
   */
  async count(spec: Specification<TDomain>): Promise<number> {
    const where = this.toPrismaWhere(spec);
    return this.model.count({ where });
  }

  /**
   * Check if any entity matches specification
   */
  async exists(spec: Specification<TDomain>): Promise<boolean> {
    const count = await this.count(spec);
    return count > 0;
  }

  /**
   * Find by ID
   */
  async findById(id: ID): Promise<TDomain | null> {
    const model = await this.model.findUnique({ where: { id } });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Save entity
   */
  async save(entity: TDomain): Promise<TDomain> {
    const data = this.toPrisma(entity);
    const id = (entity as any).getId?.() || (entity as any).id;

    let model: T;
    if (id) {
      model = await this.model.update({ where: { id }, data });
    } else {
      model = await this.model.create({ data });
    }

    return this.toDomain(model);
  }

  /**
   * Delete entity
   */
  async delete(id: ID): Promise<void> {
    await this.model.delete({ where: { id } });
  }

  /**
   * Find with pagination
   */
  async findPaginated(
    spec: Specification<TDomain>,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<TDomain>> {
    const where = this.toPrismaWhere(spec);
    const skip = (page - 1) * pageSize;

    const [models, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: pageSize,
      }),
      this.model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: models.map((m: T) => this.toDomain(m)),
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Find with sorting
   */
  async findSorted(
    spec: Specification<TDomain>,
    sortBy: keyof TDomain,
    order: 'asc' | 'desc'
  ): Promise<TDomain[]> {
    const where = this.toPrismaWhere(spec);
    const models = await this.model.findMany({
      where,
      orderBy: { [sortBy as string]: order },
    });
    return models.map((m: T) => this.toDomain(m));
  }

  /**
   * Find with advanced options
   */
  async findAdvanced(options: QueryOptions<TDomain>): Promise<PaginatedResult<TDomain>> {
    const where = options.specification
      ? this.toPrismaWhere(options.specification)
      : {};

    const orderBy = options.sorting?.map((sort) => ({
      [sort.field as string]: sort.order,
    }));

    const include = options.includes?.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as any);

    const page = options.pagination?.page || 1;
    const pageSize = options.pagination?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [models, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy,
        include,
        skip,
        take: pageSize,
      }),
      this.model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: models.map((m: T) => this.toDomain(m)),
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Bulk save
   */
  async saveMany(entities: TDomain[]): Promise<TDomain[]> {
    const data = entities.map((e) => this.toPrisma(e));
    
    // Use transaction for atomicity
    return this.prisma.$transaction(
      data.map((d) => this.model.create({ data: d }))
    ).then((models: T[]) => models.map((m) => this.toDomain(m)));
  }

  /**
   * Bulk delete
   */
  async deleteMany(spec: Specification<TDomain>): Promise<number> {
    const where = this.toPrismaWhere(spec);
    const result = await this.model.deleteMany({ where });
    return result.count;
  }
}

/**
 * Example: User Repository Implementation
 */
@Injectable()
export class PrismaUserRepository extends PrismaRepositoryBase<any, any, string> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  protected toDomain(model: any): any {
    // Convert Prisma model to User domain entity
    return {
      id: model.id,
      email: model.email,
      role: model.role,
      firstName: model.firstName,
      lastName: model.lastName,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  protected toPrisma(domain: any): any {
    // Convert User domain entity to Prisma model
    return {
      email: domain.email,
      password: domain.password,
      role: domain.role,
      firstName: domain.firstName,
      lastName: domain.lastName,
      isActive: domain.isActive,
    };
  }
}

/**
 * Usage:
 * 
 * @Injectable()
 * export class UserService {
 *   constructor(private userRepo: PrismaUserRepository) {}
 * 
 *   async getActiveDietitians() {
 *     const spec = new ActiveUsersSpec()
 *       .and(new UserByRoleSpec('DIETITIAN'));
 *     return this.userRepo.find(spec);
 *   }
 * 
 *   async searchUsers(query: string, page: number) {
 *     const spec = new UserSearchSpec(query);
 *     return this.userRepo.findPaginated(spec, page, 20);
 *   }
 * 
 *   async getRecentUsers() {
 *     return this.userRepo.findAdvanced({
 *       specification: new UserCreatedAfterSpec(new Date('2024-01-01')),
 *       pagination: { page: 1, pageSize: 10 },
 *       sorting: [{ field: 'createdAt', order: 'desc' }],
 *       includes: ['profile', 'clients'],
 *     });
 *   }
 * }
 */
