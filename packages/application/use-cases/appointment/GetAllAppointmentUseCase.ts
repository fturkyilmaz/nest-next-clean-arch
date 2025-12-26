import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AppointmentRepository } from '@domain/repositories/AppointmentRepository';
import { Appointment } from '@domain/entities/Appointment.entity';

export class GetAllAppointmentQuery implements IQuery {}

@QueryHandler(GetAllAppointmentQuery)
export class GetAllAppointmentUseCase
  implements IQueryHandler<GetAllAppointmentQuery>
{
  constructor(
    @Inject('AppointmentRepository')
    private readonly repo: AppointmentRepository,
  ) {}

  async execute(): Promise<Appointment[]> {
    return this.repo.findAll();
  }
}
