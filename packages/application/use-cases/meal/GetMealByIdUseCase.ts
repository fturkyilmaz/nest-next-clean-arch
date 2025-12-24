import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MealRepository } from '@domain/repositories/MealRepository';

export class GetMealByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetMealByIdQuery)
export class GetMealByIdUseCase implements IQueryHandler<GetMealByIdQuery> {
  constructor(private readonly repo: MealRepository) {}

  async execute(query: GetMealByIdQuery): Promise<any | null> {
    return this.repo.findById(query.id);
  }
}
