import { IPaginatedRepository, PaginatedResult } from './IPaginatedRepository';
import { ISortableRepository } from './ISortableRepository';
import { PrismaSpecification } from './PrismaSpecification';

export interface QueryOptions<T, W = any, O = any, I = any> {
    specification?: PrismaSpecification<T, W, O, I>;
    pagination?: { page: number; pageSize: number };
    sorting?: { field: keyof T; order: 'asc' | 'desc' }[];
    includes?: string[];
}

export interface IAdvancedRepository<T, ID = string, W = any>
    extends IPaginatedRepository<T, ID>,
    ISortableRepository<T, ID> {
    findAdvanced(options: QueryOptions<T, W>): Promise<PaginatedResult<T>>;
    saveMany(entities: T[]): Promise<T[]>;
    deleteMany(spec: PrismaSpecification<T, W>): Promise<number>;
}
