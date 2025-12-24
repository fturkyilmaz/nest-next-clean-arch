import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EventRepository } from '@domain/repositories/EventRepository';
import { EventLog } from '@domain/entities/EventLog.entity';

export class GetEventByIdQuery implements IQuery {
  constructor(public readonly id: string) { }
}

@QueryHandler(GetEventByIdQuery)
export class GetEventByIdUseCase
  implements IQueryHandler<GetEventByIdQuery> {
  constructor(
    @Inject('EventRepository')
    private readonly repo: EventRepository,
  ) { }

  async execute(query: GetEventByIdQuery): Promise<EventLog | null> {
    return this.repo.findById(query.id);
  }
}
