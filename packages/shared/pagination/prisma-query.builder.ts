/**
 * Prisma Query Builder for Pagination
 * Utilities for building paginated Prisma queries
 */

import { Prisma } from '@prisma/client';
import {
    PaginationQuery,
    calculateOffset,
    validateSortField,
    PAGINATION_DEFAULTS,
} from '@diet/shared/pagination';

/**
 * Prisma pagination options builder
 */
export interface PrismaPaginationOptions {
    skip: number;
    take: number;
    orderBy: Prisma.UserFindManyArgs['orderBy'];
}

/**
 * Build Prisma find options from pagination query
 */
export function buildPrismaPaginationOptions(
    query: PaginationQuery,
    defaultSort = 'createdAt',
): PrismaPaginationOptions {
    const skip = calculateOffset(query.page, query.limit);
    const take = query.limit;

    const sortBy = query.sortBy || defaultSort;
    const sortOrder = query.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    return {
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder,
        },
    };
}

/**
 * Build where clause for search
 */
export function buildSearchWhereClause(
    searchFields: string[],
    search?: string,
): Prisma.UserWhereInput | null {
    if (!search || searchFields.length === 0) {
        return null;
    }

    // Create OR conditions for each searchable field
    return {
        OR: searchFields.map(field => ({
            [field]: {
                contains: search,
                mode: 'insensitive',
            },
        })),
    } as any;
}

/**
 * Build where clause for filters
 * Supports common filter patterns
 */
export function buildFilterWhereClause(
    filters: Record<string, string | string[]> | undefined,
    allowedFields: string[],
): Prisma.UserWhereInput | null {
    if (!filters || Object.keys(filters).length === 0) {
        return null;
    }

    const whereConditions: Prisma.UserWhereInput[] = [];

    for (const [field, value] of Object.entries(filters)) {
        // Security: only allow whitelisted fields
        if (!allowedFields.includes(field)) {
            continue;
        }

        if (Array.isArray(value)) {
            // Array values - use IN operator
            whereConditions.push({
                [field]: {
                    in: value,
                },
            } as any);
        } else {
            // String value - exact match
            whereConditions.push({
                [field]: value,
            } as any);
        }
    }

    return whereConditions.length > 0
        ? {
              AND: whereConditions,
          }
        : null;
}

/**
 * Combine where clauses
 */
export function combineWhereConditions(
    ...conditions: (Prisma.UserWhereInput | null)[]
): Prisma.UserWhereInput {
    const validConditions = conditions.filter((c): c is Prisma.UserWhereInput => c !== null);

    if (validConditions.length === 0) {
        return {};
    }

    if (validConditions.length === 1) {
        return validConditions[0];
    }

    return {
        AND: validConditions,
    } as any;
}

/**
 * Type-safe pagination options for different models
 */
export interface ModelPaginationOptions<T> {
    where?: Prisma.UserWhereInput;
    skip: number;
    take: number;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    include?: Record<string, boolean | object>;
    select?: Prisma.UserSelect;
}

/**
 * Build complete Prisma find many options
 */
export function buildPrismaFindManyOptions<T>(
    query: PaginationQuery,
    options: {
        defaultSort?: string;
        searchFields?: string[];
        filterableFields?: string[];
        include?: Record<string, boolean | object>;
        select?: any;
    } = {},
): ModelPaginationOptions<T> {
    const { skip, take, orderBy } = buildPrismaPaginationOptions(
        query,
        options.defaultSort,
    );

    const searchWhere = options.searchFields
        ? buildSearchWhereClause(options.searchFields, query.search)
        : null;

    const filterWhere = options.filterableFields
        ? buildFilterWhereClause(query.filters, options.filterableFields)
        : null;

    const where = combineWhereConditions(searchWhere, filterWhere);

    return {
        where,
        skip,
        take,
        orderBy,
        include: options.include,
        select: options.select,
    } as any;
}
