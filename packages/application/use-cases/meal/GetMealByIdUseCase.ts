import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MealRepository } from '@domain/repositories/MealRepository';
import { Meal } from '@domain/entities/Meal.entity';

export class GetMealByIdQuery implements IQuery {
  constructor(public readonly id: string) { }
}

@QueryHandler(GetMealByIdQuery)
export class GetMealByIdUseCase
  implements IQueryHandler<GetMealByIdQuery> {
  constructor(
    @Inject('MealRepository')
    private readonly repo: MealRepository,
  ) { }

  async execute(query: GetMealByIdQuery): Promise<Meal | null> {
    return this.repo.findById(query.id);
  }
}
