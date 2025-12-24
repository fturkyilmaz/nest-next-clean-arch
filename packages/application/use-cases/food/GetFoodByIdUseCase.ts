import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FoodRepository } from '@domain/repositories/FoodRepository';
import { FoodItem } from '@domain/entities/FoodItem.entity';

export class GetFoodByIdQuery implements IQuery {
  constructor(public readonly id: string) { }
}

@QueryHandler(GetFoodByIdQuery)
export class GetFoodByIdUseCase
  implements IQueryHandler<GetFoodByIdQuery> {
  constructor(
    @Inject('FoodRepository')
    private readonly repo: FoodRepository,
  ) { }

  async execute(query: GetFoodByIdQuery): Promise<FoodItem | null> {
    return this.repo.findById(query.id);
  }
}
