import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllDietPlansQuery } from './GetAllDietPlansQuery';
import { Inject } from '@nestjs/common';
import { IDietPlanRepository } from '@application/interfaces';
import { DietPlan } from '@domain/entities';
import { PaginatedResponseDto } from '@application/dto/common/PaginatedResponseDto';

@QueryHandler(GetAllDietPlansQuery)
export class GetAllDietPlansHandler implements IQueryHandler<GetAllDietPlansQuery> {
    constructor(
        @Inject('IDietPlanRepository') private readonly dietPlanRepository: IDietPlanRepository
    ) { }

    async execute(query: GetAllDietPlansQuery): Promise<PaginatedResponseDto<DietPlan>> {
        const { status, isActive = true } = query;

        const [data, total] = await Promise.all([
            this.dietPlanRepository.findAll({
                status,
                isActive,
                skip: query.skip,
                take: query.take,
            }),
            this.dietPlanRepository.count({
                status,
                isActive,
            }),
        ]);

        return new PaginatedResponseDto(data, query.page, query.limit, total);
    }
}
