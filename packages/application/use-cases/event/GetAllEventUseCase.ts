import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EventRepository } from '@domain/repositories/EventRepository';
import { EventLog } from '@domain/entities/EventLog.entity';

export class GetAllEventQuery implements IQuery { }

@QueryHandler(GetAllEventQuery)
export class GetAllEventUseCase
  implements IQueryHandler<GetAllEventQuery> {
  constructor(
    @Inject('EventRepository')
    private readonly repo: EventRepository,
  ) { }

  async execute(): Promise<EventLog[]> {
    return this.repo.findAll();
  }
}
