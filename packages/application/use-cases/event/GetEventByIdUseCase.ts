import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventRepository } from '@domain/repositories/EventRepository';

export class GetEventByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetEventByIdQuery)
export class GetEventByIdUseCase implements IQueryHandler<GetEventByIdQuery> {
  constructor(private readonly repo: EventRepository) {}

  async execute(query: GetEventByIdQuery): Promise<any | null> {
    return this.repo.findById(query.id);
  }
}
