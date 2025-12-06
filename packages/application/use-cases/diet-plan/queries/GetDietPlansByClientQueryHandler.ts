import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDietPlansByClientQuery } from './GetDietPlansByClientQuery';
import { IDietPlanRepository } from '@application/interfaces/IDietPlanRepository';
import { DietPlan } from '@domain/entities/DietPlan.entity';

@QueryHandler(GetDietPlansByClientQuery)
export class GetDietPlansByClientQueryHandler
  implements IQueryHandler<GetDietPlansByClientQuery>
{
  constructor(private readonly dietPlanRepository: IDietPlanRepository) {}

  async execute(query: GetDietPlansByClientQuery): Promise<DietPlan[]> {
    return await this.dietPlanRepository.findByClientId(query.clientId, {
      status: query.status,
      isActive: query.isActive,
      skip: query.skip,
      take: query.take,
    });
  }
}
