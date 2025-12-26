/**
 * Pagination & Filtering Infrastructure
 * Shared DTOs and types for paginated list responses
 */

/**
 * Pagination query parameters
 * Used in all list endpoints
 */
export interface PaginationQuery {
    /** Page number (1-indexed) */
    page: number;
    /** Items per page */
    limit: number;
    /** Sort by field name */
    sortBy?: string;
    /** Sort direction: asc or desc */
    sortOrder?: 'asc' | 'desc';
    /** Search query text */
    search?: string;
    /** Additional filter parameters (key=value format) */
    filters?: Record<string, string | string[]>;
}

/**
 * Pagination metadata returned with list responses
 */
export interface PaginationMeta {
    /** Current page number (1-indexed) */
    page: number;
    /** Items per page */
    limit: number;
    /** Total number of items */
    total: number;
    /** Total number of pages */
    pages: number;
    /** Has next page */
    hasNext: boolean;
    /** Has previous page */
    hasPrev: boolean;
}

/**
 * Paginated list response format
 * Used for all list endpoints
 */
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

/**
 * Default pagination values
 */
export const PAGINATION_DEFAULTS = {
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
    SORT_ORDER: 'asc' as const,
} as const;

/**
 * Validate pagination query parameters
 */
export function validatePaginationQuery(query: Partial<PaginationQuery>): PaginationQuery {
    const page = Math.max(1, Math.floor(query.page ?? PAGINATION_DEFAULTS.PAGE));
    const limit = Math.min(
        Math.max(PAGINATION_DEFAULTS.MIN_LIMIT, Math.floor(query.limit ?? PAGINATION_DEFAULTS.LIMIT)),
        PAGINATION_DEFAULTS.MAX_LIMIT,
    );

    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    return {
        page,
        limit,
        sortBy: query.sortBy?.trim() || undefined,
        sortOrder,
        search: query.search?.trim() || undefined,
        filters: query.filters || undefined,
    };
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
    total: number,
    page: number,
    limit: number,
): PaginationMeta {
    const pages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
    };
}

/**
 * Calculate offset for database queries
 */
export function calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
}

/**
 * Sort field whitelist for security
 * Define allowed fields for each entity type
 */
export const SORTABLE_FIELDS: Record<string, string[]> = {
    // User fields
    user: ['id', 'email', 'firstName', 'lastName', 'createdAt', 'updatedAt'],
    
    // Client fields
    client: ['id', 'name', 'email', 'phone', 'gender', 'createdAt', 'updatedAt'],
    
    // Diet Plan fields
    dietPlan: ['id', 'name', 'status', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
    
    // Meal fields
    meal: ['id', 'name', 'mealType', 'date', 'calories', 'createdAt', 'updatedAt'],
    
    // Food fields
    food: ['id', 'name', 'category', 'calories', 'protein', 'carbs', 'fat', 'createdAt', 'updatedAt'],
    
    // Appointment fields
    appointment: ['id', 'title', 'date', 'time', 'status', 'createdAt', 'updatedAt'],
    
    // Metrics fields
    metrics: ['id', 'date', 'weight', 'bodyFat', 'createdAt', 'updatedAt'],
};

/**
 * Validate sort field against whitelist
 */
export function validateSortField(entity: string, sortBy?: string): string | undefined {
    if (!sortBy) return undefined;
    
    const allowedFields = SORTABLE_FIELDS[entity];
    if (!allowedFields) return undefined;
    
    return allowedFields.includes(sortBy) ? sortBy : undefined;
}

/**
 * Filter operators
 */
export enum FilterOperator {
    EQ = 'eq',          // Equal
    NEQ = 'neq',        // Not equal
    GT = 'gt',          // Greater than
    GTE = 'gte',        // Greater than or equal
    LT = 'lt',          // Less than
    LTE = 'lte',        // Less than or equal
    IN = 'in',          // In array
    LIKE = 'like',      // String contains
    BETWEEN = 'between', // Between range
}

/**
 * Parse filter string (key=operator:value format)
 * Example: "status=eq:active" or "calories=gte:2000"
 */
export interface ParsedFilter {
    field: string;
    operator: FilterOperator;
    value: string | string[];
}

export function parseFilter(filterStr: string): ParsedFilter | null {
    const [field, rest] = filterStr.split('=');
    if (!field || !rest) return null;

    const [operatorStr, ...valueParts] = rest.split(':');
    const value = valueParts.join(':');

    const operator = Object.values(FilterOperator).includes(operatorStr as FilterOperator)
        ? (operatorStr as FilterOperator)
        : FilterOperator.EQ;

    // Handle comma-separated values for IN operator
    const parsedValue = operator === FilterOperator.IN
        ? value.split(',').map(v => v.trim())
        : value;

    return {
        field: field.trim(),
        operator,
        value: parsedValue,
    };
}

/**
 * Search configuration per entity
 */
export const SEARCHABLE_FIELDS: Record<string, string[]> = {
    user: ['email', 'firstName', 'lastName'],
    client: ['name', 'email', 'phone'],
    dietPlan: ['name', 'description'],
    meal: ['name', 'description'],
    food: ['name', 'category'],
    appointment: ['title', 'notes'],
};
