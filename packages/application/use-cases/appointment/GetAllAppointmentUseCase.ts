import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppointmentRepository } from '@domain/repositories/AppointmentRepository';

export class GetAllAppointmentQuery implements IQuery {}

@QueryHandler(GetAllAppointmentQuery)
export class GetAllAppointmentUseCase implements IQueryHandler<GetAllAppointmentQuery> {
  constructor(private readonly repo: AppointmentRepository) {}

  async execute(): Promise<any[]> {
    return this.repo.findAll();
  }
}
