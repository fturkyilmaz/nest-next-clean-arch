import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FoodRepository } from '@domain/repositories/FoodRepository';

export class GetAllFoodQuery implements IQuery {}

@QueryHandler(GetAllFoodQuery)
export class GetAllFoodUseCase implements IQueryHandler<GetAllFoodQuery> {
  constructor(private readonly repo: FoodRepository) {}

  async execute(): Promise<any[]> {
    return this.repo.findAll();
  }
}
