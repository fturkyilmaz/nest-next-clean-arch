'use client';

import {
    UseQueryOptions,
    UseInfiniteQueryOptions,
    useQuery,
    useInfiniteQuery,
} from '@tanstack/react-query';
import {
    PaginatedResponse,
    PaginationQuery,
    PAGINATION_DEFAULTS,
} from '@diet/shared/pagination';
import axios, { AxiosInstance } from 'axios';

/**
 * React Query hooks for paginated list endpoints
 * Used in web and mobile apps
 */

interface UsePaginatedListOptions<T> extends Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryFn'> {
    apiClient: AxiosInstance;
    endpoint: string;
    query?: Partial<PaginationQuery>;
}

/**
 * Hook for paginated list queries
 * Automatically refetches when pagination params change
 */
export function usePaginatedList<T = any>(
    options: UsePaginatedListOptions<T>,
) {
    const {
        apiClient,
        endpoint,
        query = {},
        queryKey,
        ...reactQueryOptions
    } = options;

    const finalQuery = {
        page: query.page ?? PAGINATION_DEFAULTS.PAGE,
        limit: query.limit ?? PAGINATION_DEFAULTS.LIMIT,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        search: query.search,
        ...query,
    };

    const queryKeyArray = Array.isArray(queryKey)
        ? queryKey
        : [endpoint, finalQuery];

    return useQuery<PaginatedResponse<T>>({
        queryKey: queryKeyArray,
        queryFn: async () => {
            const { data } = await apiClient.get<PaginatedResponse<T>>(
                endpoint,
                { params: finalQuery },
            );
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        ...reactQueryOptions,
    });
}

interface UseInfinitePaginatedListOptions<T>
    extends Omit<UseInfiniteQueryOptions<PaginatedResponse<T>>, 'queryFn'> {
    apiClient: AxiosInstance;
    endpoint: string;
    query?: Partial<PaginationQuery>;
}

/**
 * Hook for infinite scroll pagination
 * Loads more pages as user scrolls
 */
export function useInfinitePaginatedList<T = any>(
    options: UseInfinitePaginatedListOptions<T>,
) {
    const {
        apiClient,
        endpoint,
        query = {},
        queryKey,
        ...reactQueryOptions
    } = options;

    const finalQuery = {
        limit: query.limit ?? PAGINATION_DEFAULTS.LIMIT,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        search: query.search,
        ...query,
    };

    const queryKeyArray = Array.isArray(queryKey)
        ? queryKey
        : [endpoint, finalQuery];

    return useInfiniteQuery<PaginatedResponse<T>>({
        queryKey: queryKeyArray,
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await apiClient.get<PaginatedResponse<T>>(
                endpoint,
                {
                    params: {
                        ...finalQuery,
                        page: pageParam,
                    },
                },
            );
            return data;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        ...reactQueryOptions,
    });
}

/**
 * Hook for search with pagination
 * Debounces search term and resets to page 1
 */
export function usePaginatedSearch<T = any>(
    options: UsePaginatedListOptions<T> & { debounceMs?: number },
) {
    const { debounceMs = 300, ...paginationOptions } = options;

    // Debounce search
    const [searchTerm, setSearchTerm] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchTerm, debounceMs]);

    // Reset to page 1 when search changes
    const query = React.useMemo(
        () => ({
            ...paginationOptions.query,
            search: debouncedSearch,
            page: 1,
        }),
        [debouncedSearch, paginationOptions.query],
    );

    const listQuery = usePaginatedList<T>({
        ...paginationOptions,
        query,
    });

    return {
        ...listQuery,
        searchTerm,
        setSearchTerm,
    };
}

/**
 * Flatten infinite query results
 * Converts pages into single array
 */
export function flattenInfiniteData<T>(
    data:
        | {
              pages: PaginatedResponse<T>[];
              pageParams: number[];
          }
        | undefined,
): T[] {
    if (!data) return [];
    return data.pages.flatMap(page => page.data);
}

// Import React for hooks
import * as React from 'react';
