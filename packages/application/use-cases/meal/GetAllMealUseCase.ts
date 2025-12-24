import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MealRepository } from '@domain/repositories/MealRepository';

export class GetAllMealQuery implements IQuery {}

@QueryHandler(GetAllMealQuery)
export class GetAllMealUseCase implements IQueryHandler<GetAllMealQuery> {
  constructor(private readonly repo: MealRepository) {}

  async execute(): Promise<any[]> {
    return this.repo.findAll();
  }
}
