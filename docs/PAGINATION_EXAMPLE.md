/**
 * Example: Implementing Pagination in NestJS Controller & Service
 * Shows how to use pagination utilities with a real use case (Diet Plans)
 */

// ============== CONTROLLER ==============

import {
    Controller,
    Get,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '@diet/infrastructure/guards';
import { Pagination } from '@diet/infrastructure/decorators';
import {
    PaginationQuery,
    PaginatedResponse,
} from '@diet/shared/pagination';
import { DietPlanDTO } from '@diet/shared/types';
import { ListDietPlansUseCase } from '@diet/application/handlers';

/**
 * Example Diet Plans Controller with pagination
 */
@Controller('api/diet-plans')
@UseGuards(JwtAuthGuard)
export class DietPlansController {
    constructor(private readonly listDietPlansUseCase: ListDietPlansUseCase) {}

    /**
     * List diet plans with pagination, search, and filtering
     * 
     * Query parameters:
     * - page: number (default: 1)
     * - limit: number (default: 20, max: 100)
     * - search: string (searches name and description)
     * - sortBy: string (allowed: id, name, status, startDate, endDate, createdAt, updatedAt)
     * - sortOrder: 'asc' | 'desc' (default: asc)
     * - filters[status]: diet plan status (ACTIVE, INACTIVE, COMPLETED)
     * - filters[userId]: filter by user ID
     * 
     * Examples:
     * GET /api/diet-plans
     * GET /api/diet-plans?page=2&limit=50
     * GET /api/diet-plans?search=low%20carb&sortBy=startDate&sortOrder=desc
     * GET /api/diet-plans?filters[status]=ACTIVE&filters[userId]=user123
     */
    @Get()
    async list(
        @Pagination() query: PaginationQuery,
        @Req() req: any,
    ): Promise<PaginatedResponse<DietPlanDTO>> {
        const userId = req.user.id; // From JWT token
        
        return this.listDietPlansUseCase.execute({
            ...query,
            userId, // Ensure user only sees their own plans
        });
    }
}

// ============== USE CASE ==============

import { Injectable } from '@nestjs/common';
import {
    calculatePaginationMeta,
    validateSortField,
    SORTABLE_FIELDS,
} from '@diet/shared/pagination';
import { DietPlanRepository } from '@diet/infrastructure/repositories';
import { buildPrismaPaginationOptions, buildPrismaFindManyOptions } from '@diet/shared/pagination';

interface ListDietPlansInput extends PaginationQuery {
    userId: string;
}

@Injectable()
export class ListDietPlansUseCase {
    constructor(private readonly dietPlanRepo: DietPlanRepository) {}

    async execute(input: ListDietPlansInput): Promise<PaginatedResponse<DietPlanDTO>> {
        // Validate sort field for security
        const validSortBy = validateSortField('dietPlan', input.sortBy);

        // Get total count for pagination metadata
        const total = await this.dietPlanRepo.count({
            userId: input.userId,
            search: input.search,
            filters: input.filters,
        });

        // Build Prisma options with pagination, search, and filters
        const options = buildPrismaFindManyOptions(input, {
            defaultSort: 'createdAt',
            searchFields: ['name', 'description'],
            filterableFields: ['status', 'userId'],
            include: {
                user: {
                    select: { id: true, email: true, firstName: true },
                },
            },
        });

        // Override sort field if validated
        if (validSortBy) {
            options.orderBy = { [validSortBy]: input.sortOrder };
        }

        // Execute query
        const data = await this.dietPlanRepo.findMany({
            ...options,
            where: {
                ...options.where,
                userId: input.userId, // Always filter by user
            },
        });

        // Map to DTOs
        const dtos = data.map(plan => DietPlanDTO.fromEntity(plan));

        // Calculate pagination metadata
        const meta = calculatePaginationMeta(total, input.page, input.limit);

        return {
            data: dtos,
            meta,
        };
    }
}

// ============== REPOSITORY ==============

import { PrismaService } from '@diet/infrastructure/prisma';

@Injectable()
export class DietPlanRepository {
    constructor(private prisma: PrismaService) {}

    /**
     * Find paginated diet plans
     */
    async findMany(options: any) {
        return this.prisma.dietPlan.findMany({
            ...options,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy,
        });
    }

    /**
     * Count diet plans with filters
     */
    async count(filters: {
        userId: string;
        search?: string;
        filters?: Record<string, string | string[]>;
    }): Promise<number> {
        return this.prisma.dietPlan.count({
            where: {
                userId: filters.userId,
                AND: [
                    filters.search ? {
                        OR: [
                            { name: { contains: filters.search, mode: 'insensitive' } },
                            { description: { contains: filters.search, mode: 'insensitive' } },
                        ],
                    } : {},
                    filters.filters?.status ? {
                        status: {
                            in: Array.isArray(filters.filters.status)
                                ? filters.filters.status
                                : [filters.filters.status],
                        },
                    } : {},
                ],
            },
        });
    }
}

// ============== FRONTEND USAGE ==============

/**
 * Example React component using pagination hooks
 */
import React, { useState } from 'react';
import { usePaginatedList } from '@diet/web/hooks';
import { PaginationToolbar } from '@diet/web/components';
import { useApiClient } from '@diet/web/contexts';

export function DietPlansListPage() {
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

    if (error) {
        return <div>Error loading diet plans</div>;
    }

    return (
        <div className="space-y-4">
            {/* Pagination toolbar with search, sort, limit */}
            <PaginationToolbar
                meta={data?.meta || { page: 1, limit: 20, total: 0, pages: 0, hasNext: false, hasPrev: false }}
                searchValue={query.search}
                onSearchChange={(search) => setQuery({ ...query, search, page: 1 })}
                onPageChange={(page) => setQuery({ ...query, page })}
                onLimitChange={(limit) => setQuery({ ...query, limit, page: 1 })}
                sortBy={query.sortBy}
                sortOrder={query.sortOrder}
                onSortChange={(sortBy, sortOrder) => setQuery({ ...query, sortBy, sortOrder })}
                sortableFields={[
                    { value: 'name', label: 'Name' },
                    { value: 'status', label: 'Status' },
                    { value: 'startDate', label: 'Start Date' },
                    { value: 'createdAt', label: 'Created' },
                ]}
                isLoading={isLoading}
            />

            {/* List */}
            <div className="grid gap-4">
                {data?.data.map(plan => (
                    <div key={plan.id} className="p-4 border rounded-lg">
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-sm text-gray-600">{plan.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
