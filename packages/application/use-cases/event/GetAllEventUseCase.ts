import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventRepository } from '@domain/repositories/EventRepository';

export class GetAllEventQuery implements IQuery {}

@QueryHandler(GetAllEventQuery)
export class GetAllEventUseCase implements IQueryHandler<GetAllEventQuery> {
  constructor(private readonly repo: EventRepository) {}

  async execute(): Promise<any[]> {
    return this.repo.findAll();
  }
}
