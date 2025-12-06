import { Specification } from '@domain/specifications/Specification';

/**
 * Generic Repository Specification Pattern
 * Allows complex, reusable queries with type safety
 */

/**
 * Base Repository Interface with Specification support
 */
export interface IRepository<T, ID = string> {
  /**
   * Find entities matching specification
   */
  find(spec: Specification<T>): Promise<T[]>;

  /**
   * Find single entity matching specification
   */
  findOne(spec: Specification<T>): Promise<T | null>;

  /**
   * Count entities matching specification
   */
  count(spec: Specification<T>): Promise<number>;

  /**
   * Check if any entity matches specification
   */
  exists(spec: Specification<T>): Promise<boolean>;

  /**
   * Find by ID
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Save entity
   */
  save(entity: T): Promise<T>;

  /**
   * Delete entity
   */
  delete(id: ID): Promise<void>;
}

/**
 * Paginated Repository Interface
 */
export interface IPaginatedRepository<T, ID = string> extends IRepository<T, ID> {
  /**
   * Find with pagination
   */
  findPaginated(
    spec: Specification<T>,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<T>>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Sortable Repository Interface
 */
export interface ISortableRepository<T, ID = string> extends IRepository<T, ID> {
  /**
   * Find with sorting
   */
  findSorted(
    spec: Specification<T>,
    sortBy: keyof T,
    order: 'asc' | 'desc'
  ): Promise<T[]>;
}

/**
 * Full-featured Repository Interface
 */
export interface IAdvancedRepository<T, ID = string>
  extends IPaginatedRepository<T, ID>,
    ISortableRepository<T, ID> {
  /**
   * Find with pagination and sorting
   */
  findAdvanced(options: QueryOptions<T>): Promise<PaginatedResult<T>>;

  /**
   * Bulk operations
   */
  saveMany(entities: T[]): Promise<T[]>;
  deleteMany(spec: Specification<T>): Promise<number>;
}

export interface QueryOptions<T> {
  specification?: Specification<T>;
  pagination?: {
    page: number;
    pageSize: number;
  };
  sorting?: {
    field: keyof T;
    order: 'asc' | 'desc';
  }[];
  includes?: string[];
}

/**
 * Repository Specifications for Prisma
 * Translates domain specifications to Prisma queries
 */
export interface PrismaSpecification<T> {
  /**
   * Convert to Prisma where clause
   */
  toPrismaWhere(): any;

  /**
   * Convert to Prisma orderBy clause
   */
  toPrismaOrderBy?(): any;

  /**
   * Convert to Prisma include clause
   */
  toPrismaInclude?(): any;
}

/**
 * Example: User Repository Specifications
 */
export class UserByEmailSpec extends Specification<any> {
  constructor(private readonly email: string) {
    super();
  }

  isSatisfiedBy(user: any): boolean {
    return user.email === this.email;
  }

  toPrismaWhere() {
    return { email: this.email };
  }
}

export class UserByRoleSpec extends Specification<any> {
  constructor(private readonly role: string) {
    super();
  }

  isSatisfiedBy(user: any): boolean {
    return user.role === this.role;
  }

  toPrismaWhere() {
    return { role: this.role };
  }
}

export class ActiveUsersSpec extends Specification<any> {
  isSatisfiedBy(user: any): boolean {
    return user.isActive === true;
  }

  toPrismaWhere() {
    return { isActive: true };
  }
}

export class UserCreatedAfterSpec extends Specification<any> {
  constructor(private readonly date: Date) {
    super();
  }

  isSatisfiedBy(user: any): boolean {
    return user.createdAt > this.date;
  }

  toPrismaWhere() {
    return { createdAt: { gt: this.date } };
  }
}

/**
 * Composite Specification that combines Prisma queries
 */
export class CompositeSpec<T> extends Specification<T> {
  constructor(
    private readonly left: any,
    private readonly right: any,
    private readonly operator: 'AND' | 'OR'
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    if (this.operator === 'AND') {
      return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
    }
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }

  toPrismaWhere() {
    const leftWhere = this.left.toPrismaWhere?.() || {};
    const rightWhere = this.right.toPrismaWhere?.() || {};

    if (this.operator === 'AND') {
      return { AND: [leftWhere, rightWhere] };
    }
    return { OR: [leftWhere, rightWhere] };
  }
}

/**
 * Usage Example:
 * 
 * // Simple specification
 * const activeUsers = new ActiveUsersSpec();
 * const users = await userRepository.find(activeUsers);
 * 
 * // Composite specification
 * const activeDietitians = new ActiveUsersSpec()
 *   .and(new UserByRoleSpec('DIETITIAN'));
 * const dietitians = await userRepository.find(activeDietitians);
 * 
 * // Complex query
 * const recentActiveDietitians = new ActiveUsersSpec()
 *   .and(new UserByRoleSpec('DIETITIAN'))
 *   .and(new UserCreatedAfterSpec(new Date('2024-01-01')));
 * const users = await userRepository.find(recentActiveDietitians);
 * 
 * // With pagination
 * const result = await userRepository.findPaginated(
 *   recentActiveDietitians,
 *   1,
 *   20
 * );
 */
