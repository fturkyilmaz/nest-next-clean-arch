import { Specification } from '@domain/specifications/Specification';

export interface IRepository<T, ID = string> {
  find(spec: Specification<T>): Promise<T[]>;
  findOne(spec: Specification<T>): Promise<T | null>;
  count(spec: Specification<T>): Promise<number>;
  exists(spec: Specification<T>): Promise<boolean>;
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
}
