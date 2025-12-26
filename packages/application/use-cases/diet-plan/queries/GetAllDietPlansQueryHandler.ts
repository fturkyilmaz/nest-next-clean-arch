import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllDietPlansQuery } from './GetAllDietPlansQuery';
import { Inject } from '@nestjs/common';
import { IDietPlanRepository } from '@application/interfaces';
import { DietPlan } from '@domain/entities';

@QueryHandler(GetAllDietPlansQuery)
export class GetAllDietPlansHandler implements IQueryHandler<GetAllDietPlansQuery> {
    constructor(
        @Inject('IDietPlanRepository') private readonly dietPlanRepository: IDietPlanRepository
    ) { }

    async execute(query: GetAllDietPlansQuery): Promise<DietPlan[]> {
        const { status, isActive = true, skip = 0, take = 10 } = query;
        console.log(status, isActive, skip, take);
        return await this.dietPlanRepository.findAll({ status, isActive, skip, take });
    }
}
