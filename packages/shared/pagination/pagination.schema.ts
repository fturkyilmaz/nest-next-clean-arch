import { z } from 'zod';
import {
    PAGINATION_DEFAULTS,
    FilterOperator,
} from './index';

/**
 * Zod schemas for pagination query validation
 */

export const paginationQuerySchema = z.object({
    page: z.coerce
        .number()
        .int('Page must be an integer')
        .min(1, 'Page must be at least 1')
        .default(PAGINATION_DEFAULTS.PAGE),
    limit: z.coerce
        .number()
        .int('Limit must be an integer')
        .min(PAGINATION_DEFAULTS.MIN_LIMIT, `Limit must be at least ${PAGINATION_DEFAULTS.MIN_LIMIT}`)
        .max(PAGINATION_DEFAULTS.MAX_LIMIT, `Limit cannot exceed ${PAGINATION_DEFAULTS.MAX_LIMIT}`)
        .default(PAGINATION_DEFAULTS.LIMIT),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default(PAGINATION_DEFAULTS.SORT_ORDER),
    search: z.string().optional(),
});

export type PaginationQuerySchemaType = z.infer<typeof paginationQuerySchema>;

/**
 * Generic filter schema
 */
export const filterSchema = z.object({
    field: z.string(),
    operator: z.nativeEnum(FilterOperator),
    value: z.union([z.string(), z.array(z.string())]),
});

/**
 * Extended pagination schema with filters
 */
export const paginationWithFiltersSchema = paginationQuerySchema.extend({
    filters: z.record(z.union([z.string(), z.array(z.string())])).optional(),
});

export type PaginationWithFiltersSchemaType = z.infer<typeof paginationWithFiltersSchema>;
