import {
    createParamDecorator,
    ExecutionContext,
    BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import {
    PaginationQuery,
    validatePaginationQuery,
} from '@diet/shared/pagination';

/**
 * @Pagination() decorator for NestJS controllers
 * Automatically validates and provides pagination query from request
 * 
 * Usage:
 * @Get()
 * async list(@Pagination() query: PaginationQuery) {
 *   return this.service.findPaginated(query);
 * }
 */
export const Pagination = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): PaginationQuery => {
        const req = ctx.switchToHttp().getRequest<Request>();
        
        try {
            const query = validatePaginationQuery({
                page: req.query.page as any,
                limit: req.query.limit as any,
                sortBy: req.query.sortBy as string,
                sortOrder: req.query.sortOrder as 'asc' | 'desc',
                search: req.query.search as string,
                filters: req.query.filters as Record<string, string | string[]>,
            });
            
            return query;
        } catch (error) {
            throw new BadRequestException('Invalid pagination parameters');
        }
    },
);

/**
 * Guard to enforce maximum page size
 * Prevents DOS attacks by limiting result sets
 */
export class MaxPageSizeGuard {
    constructor(private maxSize = 100) {}

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>();
        const limit = parseInt(req.query.limit as string) || 20;

        if (limit > this.maxSize) {
            throw new BadRequestException(
                `Maximum limit is ${this.maxSize}`,
            );
        }

        return true;
    }
}
