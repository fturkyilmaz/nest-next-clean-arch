import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AppointmentRepository } from '@domain/repositories/AppointmentRepository';
import { Appointment } from '@domain/entities/Appointment.entity';

export class GetAppointmentByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetAppointmentByIdQuery)
export class GetAppointmentByIdUseCase
  implements IQueryHandler<GetAppointmentByIdQuery>
{
  constructor(
    @Inject('AppointmentRepository')
    private readonly repo: AppointmentRepository,
  ) {}

  async execute(query: GetAppointmentByIdQuery): Promise<Appointment | null> {
    return this.repo.findById(query.id);
  }
}
