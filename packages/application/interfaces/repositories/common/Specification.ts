/**
 * Base Specification Pattern
 * T: Domain entity type
 */
export abstract class Specification<T> {
    /**
     * Check if entity satisfies the specification (domain-level check)
     */
    abstract isSatisfiedBy(entity: T): boolean;

    /**
     * Convert to Prisma where clause
     */
    toPrismaWhere?(): any;

    /**
     * Convert to Prisma orderBy clause
     */
    toPrismaOrderBy?(): any;

    /**
     * Convert to Prisma include clause
     */
    toPrismaInclude?(): any;
}
