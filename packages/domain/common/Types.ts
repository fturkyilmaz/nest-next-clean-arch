/**
 * Advanced TypeScript utility types for the application
 */

/**
 * Deep Readonly - makes all nested properties readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Deep Partial - makes all nested properties optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Nullable - makes type nullable
 */
export type Nullable<T> = T | null;

/**
 * Optional - makes type optional
 */
export type Optional<T> = T | undefined;

/**
 * ValueOf - gets the type of object values
 */
export type ValueOf<T> = T[keyof T];

/**
 * Awaited - unwraps Promise type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * NonEmptyArray - ensures array has at least one element
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Exact - ensures exact type match (no extra properties)
 */
export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

/**
 * Brand - creates a branded type for type safety
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Example branded types
 */
export type UserId = Brand<string, 'UserId'>;
export type ClientId = Brand<string, 'ClientId'>;
export type DietPlanId = Brand<string, 'DietPlanId'>;
export type EmailAddress = Brand<string, 'EmailAddress'>;

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Sort types
 */
export type SortOrder = 'asc' | 'desc';

export interface SortParams<T> {
  field: keyof T;
  order: SortOrder;
}

/**
 * Filter types
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';

export interface FilterCondition<T> {
  field: keyof T;
  operator: FilterOperator;
  value: any;
}

/**
 * Query builder types
 */
export interface QueryOptions<T> {
  pagination?: PaginationParams;
  sort?: SortParams<T>[];
  filters?: FilterCondition<T>[];
  include?: (keyof T)[];
}

/**
 * Domain Event types
 */
export interface IDomainEvent {
  occurredOn: Date;
  aggregateId: string;
  eventType: string;
}

export abstract class DomainEvent implements IDomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly eventType: string
  ) {
    this.occurredOn = new Date();
  }
}

/**
 * Entity base types
 */
export interface IEntity<T> {
  getId(): T;
  equals(other: IEntity<T>): boolean;
}

export abstract class Entity<T> implements IEntity<T> {
  protected readonly id: T;

  constructor(id: T) {
    this.id = id;
  }

  public getId(): T {
    return this.id;
  }

  public equals(other: Entity<T>): boolean {
    if (!(other instanceof Entity)) {
      return false;
    }
    return this.id === other.id;
  }
}

/**
 * Value Object base types
 */
export interface IValueObject {
  equals(other: IValueObject): boolean;
}

export abstract class ValueObject implements IValueObject {
  abstract equals(other: IValueObject): boolean;
}
