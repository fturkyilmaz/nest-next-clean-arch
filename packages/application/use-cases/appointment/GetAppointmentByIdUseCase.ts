import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppointmentRepository } from '@domain/repositories/AppointmentRepository';

export class GetAppointmentByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetAppointmentByIdQuery)
export class GetAppointmentByIdUseCase implements IQueryHandler<GetAppointmentByIdQuery> {
  constructor(private readonly repo: AppointmentRepository) {}

  async execute(query: GetAppointmentByIdQuery): Promise<any | null> {
    return this.repo.findById(query.id);
  }
}
