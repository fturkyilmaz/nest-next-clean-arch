import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';
import {
  IAdvancedRepository,
  IRepositorySpecification,
} from '@application/interfaces/repositories/common/IAdvancedRepository';
import { Specification } from '@domain/specifications/Specification';

/**
 * Generic Prisma Repository Base Class
 * Implements specification pattern with Prisma
 */
@Injectable()
export abstract class PrismaRepositoryBase<T, TDomain, ID = string>
  implements IAdvancedRepository<TDomain>
{
  protected toPrismaOrderBy(orderBy?: string): any {
    if (!orderBy) {
      return undefined;
    }
    const [field, order] = orderBy.split(':');
    return { [field]: order || 'asc' };
  }

  protected toPrismaInclude(includes?: string[]): any {
    if (!includes || includes.length === 0) {
      return undefined;
    }
    return includes.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as any);
  }

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
  protected toPrismaWhere(spec: IRepositorySpecification<TDomain>): any {
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
   * Find entity by ID
   */
  async findById(id: ID): Promise<TDomain | null> {
    const model = await this.model.findUnique({ where: { id } });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Find all entities
   */
  async findAll(): Promise<TDomain[]> {
    const models = await this.model.findMany({});
    return models.map((m: T) => this.toDomain(m));
  }

  /**
   * Create a new entity
   */
  async create(entity: TDomain): Promise<TDomain> {
    const data = this.toPrisma(entity);
    const model = await this.model.create({ data });
    return this.toDomain(model);
  }

  /**
   * Update an existing entity
   */
  async update(id: ID, entity: TDomain): Promise<TDomain | null> {
    const data = this.toPrisma(entity);
    const model = await this.model.update({ where: { id }, data });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Delete an entity by ID
   */
  async delete(id: ID): Promise<boolean> {
    try {
      await this.model.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Find entities by specification
   */
  async findBySpecification(specification: IRepositorySpecification<TDomain>): Promise<TDomain[]> {
    const where = this.toPrismaWhere(specification);
    const models = await this.model.findMany({ where });
    return models.map((m: T) => this.toDomain(m));
  }

  /**
   * Count entities by specification
   */
  async countBySpecification(specification: IRepositorySpecification<TDomain>): Promise<number> {
    const where = this.toPrismaWhere(specification);
    return this.model.count({ where });
  }

  /**
   * Find and paginate entities by specification
   */
  async findAndPaginate(
    specification: IRepositorySpecification<TDomain>,
    page: number,
    limit: number,
    orderBy?: string, // e.g., "createdAt:desc"
  ): Promise<{ data: TDomain[]; total: number; page: number; limit: number }> {
    const where = this.toPrismaWhere(specification);
    const skip = (page - 1) * limit;

    const [models, total] = await Promise.all([
      this.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.toPrismaOrderBy(orderBy),
      }),
      this.model.count({ where }),
    ]);

    return {
      data: models.map((m: T) => this.toDomain(m)),
      total,
      page,
      limit,
    };
  }
}
