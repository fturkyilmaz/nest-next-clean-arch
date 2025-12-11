import { IRepository } from './IRepository';
import { Specification } from '@domain/specifications/Specification';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface IPaginatedRepository<T, ID = string> extends IRepository<T, ID> {
  findPaginated(
    spec: Specification<T>,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<T>>;
}
