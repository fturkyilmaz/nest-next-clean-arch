# Pagination & Filtering Implementation Guide

## Overview

A complete pagination system for the diet-plan-ai application with:

- **Unified Pagination Format**: Consistent paginated responses across all list endpoints
- **Query Parameter Validation**: Type-safe pagination query parameter handling
- **Search & Filtering**: Full-text search and field-based filtering with security
- **Prisma Integration**: Query builder utilities for efficient database queries
- **React Query Hooks**: Optimized hooks for web app data fetching
- **Mobile Support**: React Native components for mobile pagination
- **Frontend Components**: Reusable pagination UI components
- **Sort Control**: Multi-field sorting with configurable direction

## Architecture

### Core Pagination Types (`packages/shared/pagination/index.ts`)

```typescript
// Query parameters from client
interface PaginationQuery {
    page: number;           // 1-indexed page number
    limit: number;          // Items per page (1-100)
    sortBy?: string;        // Field to sort by
    sortOrder?: 'asc' | 'desc';  // Sort direction
    search?: string;        // Full-text search
    filters?: Record<string, string | string[]>;  // Field filters
}

// Response metadata
interface PaginationMeta {
    page: number;           // Current page
    limit: number;          // Items per page
    total: number;          // Total items across all pages
    pages: number;          // Total pages
    hasNext: boolean;       // Has next page
    hasPrev: boolean;       // Has previous page
}

// Response format for all list endpoints
interface PaginatedResponse<T> {
    data: T[];              // Array of items
    meta: PaginationMeta;   // Pagination metadata
}
```

### Defaults & Limits

```typescript
const PAGINATION_DEFAULTS = {
    PAGE: 1,           // First page
    LIMIT: 20,         // Items per page
    MAX_LIMIT: 100,    // Maximum items per page
    MIN_LIMIT: 1,      // Minimum items per page
    SORT_ORDER: 'asc', // Default sort order
};
```

### Validation

```typescript
// Automatically validates and clamps pagination parameters
const query = validatePaginationQuery({
    page: 5,      // ✓ Valid
    limit: 200,   // Clamped to 100
    sortBy: 'invalid_field', // Validated separately
});
// Result: { page: 5, limit: 100, sortBy: undefined, sortOrder: 'asc' }
```

## Backend Implementation

### NestJS Controller with Pagination

```typescript
import { Controller, Get } from '@nestjs/common';
import { Pagination } from '@diet/infrastructure/decorators';
import { PaginationQuery, PaginatedResponse } from '@diet/shared/pagination';
import { ListDietPlansUseCase } from '@diet/application/handlers';

@Controller('api/diet-plans')
export class DietPlansController {
    constructor(private listDietPlansUseCase: ListDietPlansUseCase) {}

    @Get()
    async list(
        @Pagination() query: PaginationQuery,
    ): Promise<PaginatedResponse<DietPlanDTO>> {
        return this.listDietPlansUseCase.execute(query);
    }
}
```

### @Pagination() Decorator

Automatically validates pagination query parameters:

```typescript
// Usage in controller
@Get()
async list(@Pagination() query: PaginationQuery) {
    // query is validated and ready to use
}
```

### Use Case with Prisma Query Builder

```typescript
import {
    buildPrismaFindManyOptions,
    calculatePaginationMeta,
} from '@diet/shared/pagination';

@Injectable()
export class ListDietPlansUseCase {
    constructor(private dietPlanRepo: DietPlanRepository) {}

    async execute(query: PaginationQuery) {
        // Get total count
        const total = await this.dietPlanRepo.count();

        // Build Prisma options with pagination, search, filters
        const options = buildPrismaFindManyOptions(query, {
            defaultSort: 'createdAt',
            searchFields: ['name', 'description'],
            filterableFields: ['status', 'userId'],
            include: { user: true },
        });

        // Execute query
        const data = await this.dietPlanRepo.findMany(options);

        // Calculate pagination metadata
        const meta = calculatePaginationMeta(total, query.page, query.limit);

        return { data, meta };
    }
}
```

### Repository Implementation

```typescript
@Injectable()
export class DietPlanRepository {
    constructor(private prisma: PrismaService) {}

    async findMany(options: any) {
        return this.prisma.dietPlan.findMany({
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy,
            where: options.where,
            include: options.include,
        });
    }

    async count(where?: Prisma.DietPlanWhereInput) {
        return this.prisma.dietPlan.count({ where });
    }
}
```

## Frontend Implementation (Web)

### React Query Hook

```typescript
import { usePaginatedList } from '@diet/web/hooks';
import { useApiClient } from '@diet/web/contexts';

function DietPlansList() {
    const apiClient = useApiClient();
    const [query, setQuery] = useState({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
        search: '',
    });

    const { data, isLoading, error } = usePaginatedList({
        apiClient,
        endpoint: '/api/diet-plans',
        query,
    });

    // Hook automatically refetches when query changes
    // and caches results with React Query
}
```

### Pagination Toolbar Component

Complete pagination UI with search, sort, limit, and navigation:

```typescript
<PaginationToolbar
    meta={data?.meta}
    searchValue={query.search}
    onSearchChange={(search) => setQuery({ ...query, search, page: 1 })}
    onPageChange={(page) => setQuery({ ...query, page })}
    onLimitChange={(limit) => setQuery({ ...query, limit, page: 1 })}
    sortBy={query.sortBy}
    sortOrder={query.sortOrder}
    onSortChange={(sortBy, sortOrder) => setQuery({ ...query, sortBy, sortOrder })}
    sortableFields={[
        { value: 'name', label: 'Name' },
        { value: 'createdAt', label: 'Created' },
    ]}
    isLoading={isLoading}
/>
```

### Individual Components

Use individual components if you need custom layouts:

```typescript
// Pagination controls (previous/next + page numbers)
<PaginationControls
    meta={meta}
    onPageChange={handlePageChange}
    isLoading={isLoading}
/>

// Items per page selector
<LimitSelector
    currentLimit={query.limit}
    onLimitChange={(limit) => setQuery({ ...query, limit })}
/>

// Sort field and order controls
<SortControls
    sortBy={query.sortBy}
    sortOrder={query.sortOrder}
    onSortChange={(sortBy, sortOrder) => setQuery({ ...query, sortBy, sortOrder })}
    sortableFields={[...]}
/>

// Search input with debouncing
<SearchInput
    value={query.search}
    onChange={setSearchValue}
/>
```

### Infinite Scroll

For mobile-style infinite scroll pagination:

```typescript
const { data, fetchNextPage, hasNextPage, isFetching } =
    useInfinitePaginatedList({
        apiClient,
        endpoint: '/api/diet-plans',
        query,
    });

const allItems = flattenInfiniteData(data);

return (
    <FlatList
        data={allItems}
        renderItem={({ item }) => <DietPlanCard plan={item} />}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
            if (hasNextPage && !isFetching) {
                fetchNextPage();
            }
        }}
        onEndReachedThreshold={0.2}
    />
);
```

## Frontend Implementation (Mobile)

### Mobile Pagination Components

React Native optimized components:

```typescript
import { MobilePaginationToolbar } from '@diet/mobile/components';

function DietPlansScreen() {
    const [query, setQuery] = useState({
        page: 1,
        limit: 20,
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
    });

    return (
        <MobilePaginationToolbar
            meta={data?.meta}
            searchValue={query.search}
            onSearchChange={(search) => setQuery({ ...query, search, page: 1 })}
            onPageChange={(page) => setQuery({ ...query, page })}
            onLimitChange={(limit) => setQuery({ ...query, limit })}
            sortBy={query.sortBy}
            sortOrder={query.sortOrder}
            onSortChange={(sortBy, sortOrder) =>
                setQuery({ ...query, sortBy, sortOrder })
            }
            sortableFields={[...]}
            isLoading={isLoading}
        />
    );
}
```

## API Endpoint Examples

### Basic Pagination

```
GET /api/diet-plans?page=1&limit=20
```

Response:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### With Search

```
GET /api/diet-plans?page=1&limit=20&search=low%20carb
```

### With Sorting

```
GET /api/diet-plans?page=1&limit=20&sortBy=startDate&sortOrder=desc
```

### With Filtering

```
GET /api/diet-plans?page=1&filters[status]=ACTIVE&filters[userId]=user123
```

### Combined Example

```
GET /api/diet-plans?page=2&limit=50&search=keto&sortBy=createdAt&sortOrder=desc&filters[status]=ACTIVE
```

## Search Configuration

Define searchable fields per entity:

```typescript
const SEARCHABLE_FIELDS = {
    user: ['email', 'firstName', 'lastName'],
    client: ['name', 'email', 'phone'],
    dietPlan: ['name', 'description'],
    meal: ['name', 'description'],
    food: ['name', 'category'],
};
```

Search performs case-insensitive partial matching on configured fields.

## Sorting Configuration

Whitelist sortable fields for security:

```typescript
const SORTABLE_FIELDS = {
    dietPlan: ['id', 'name', 'status', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
    meal: ['id', 'name', 'mealType', 'date', 'calories', 'createdAt', 'updatedAt'],
    // ...
};

// Validated during request handling
const validSortBy = validateSortField('dietPlan', req.query.sortBy);
```

## Filtering

### Simple Filter

Filter by exact field values:

```
GET /api/diet-plans?filters[status]=ACTIVE
```

### Multiple Values (IN)

Filter by multiple values:

```
GET /api/diet-plans?filters[status]=ACTIVE,COMPLETED
```

### Whitelisting

Only allow filtering on specific fields:

```typescript
const filterableFields = ['status', 'userId', 'startDate'];
// Other fields will be ignored
```

## Performance Considerations

### N+1 Query Prevention

Use Prisma `include` to prevent N+1 queries:

```typescript
const options = buildPrismaFindManyOptions(query, {
    include: {
        user: true,           // Include related user
        meals: { take: 5 },   // Include first 5 meals
    },
});
```

### Database Indexes

Create indexes for commonly sorted and filtered fields:

```prisma
model DietPlan {
    id        String   @id @default(cuid())
    userId    String
    status    String
    createdAt DateTime @default(now())

    @@index([userId])
    @@index([status])
    @@index([createdAt])
}
```

### Caching

React Query automatically caches paginated responses:

```typescript
usePaginatedList({
    apiClient,
    endpoint: '/api/diet-plans',
    query,
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 10,    // 10 minutes
});
```

## Security

### Rate Limiting

Enforce maximum page size to prevent DOS:

```typescript
const MAX_LIMIT = 100;
// Limits enforced in validatePaginationQuery()
```

### Authorization

Always filter by user or role:

```typescript
// Filter by authenticated user
const options = buildPrismaFindManyOptions(query, {
    filterableFields: ['status'],
    // ...
});

const data = await prisma.dietPlan.findMany({
    ...options,
    where: {
        ...options.where,
        userId: req.user.id,  // Ensure user can only see their data
    },
});
```

### SQL Injection Prevention

All queries use Prisma ORM which prevents SQL injection:

```typescript
// Safe - parameterized query
const data = await prisma.dietPlan.findMany({
    where: {
        name: { contains: search, mode: 'insensitive' },
    },
});
```

## Best Practices

1. **Always validate pagination parameters**: Use `validatePaginationQuery()`

2. **Whitelist sortable and filterable fields**: Prevent unexpected database queries

3. **Use default sort**: Ensure consistent ordering

   ```typescript
   buildPrismaFindManyOptions(query, {
       defaultSort: 'createdAt',  // Fallback sort
   })
   ```

4. **Include related data**: Use Prisma `include` to prevent N+1 queries

5. **Cache responses**: Set appropriate `staleTime` and `gcTime` in React Query

6. **Reset to page 1**: When search or filters change

   ```typescript
   onSearchChange={(search) => setQuery({ ...query, search, page: 1 })}
   ```

7. **Show result count**: Help users understand the dataset

   ```typescript
   Showing 21-40 of 150 results
   ```

## Troubleshooting

### Results not updating when changing search

→ Make sure to reset `page: 1` when search/filters change

### Incorrect sort order

→ Validate sort field against `SORTABLE_FIELDS` whitelist

### Missing results on pagination

→ Check that `include` relationships don't cause Prisma to return fewer items

### Performance issues with large datasets

→ Add database indexes for commonly sorted/filtered fields

→ Use `select` instead of `include` if you don't need relationships
