import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FoodRepository } from '@domain/repositories/FoodRepository';

export class GetFoodByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetFoodByIdQuery)
export class GetFoodByIdUseCase implements IQueryHandler<GetFoodByIdQuery> {
  constructor(private readonly repo: FoodRepository) {}

  async execute(query: GetFoodByIdQuery): Promise<any | null> {
    return this.repo.findById(query.id);
  }
}
