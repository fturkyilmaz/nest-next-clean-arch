import { IRepository } from './IRepository';
import { Specification } from '@domain/specifications/Specification';

export interface ISortableRepository<T, ID = string> extends IRepository<T, ID> {
    findSorted(
        spec: Specification<T>,
        sortBy: keyof T,
        order: 'asc' | 'desc'
    ): Promise<T[]>;
}
