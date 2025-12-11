import { ISpecification } from "@domain/specifications/Specification";

/**
 * Generic Prisma Specification Interface
 * T: Domain entity type
 * W: Prisma where input type
 * O: Prisma orderBy input type
 * I: Prisma include input type
 */
export interface PrismaSpecification<
    T,
    W = any,
    O = any,
    I = any
> extends ISpecification<T> {
    /**
     * Convert to Prisma where clause
     */
    toPrismaWhere(): W;

    /**
     * Convert to Prisma orderBy clause
     */
    toPrismaOrderBy?(): O;

    /**
     * Convert to Prisma include clause
     */
    toPrismaInclude?(): I;

    /**
     * Optional domain-level check
     */
    isSatisfiedBy(entity: T): boolean;
}
