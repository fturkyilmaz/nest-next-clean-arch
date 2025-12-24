import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentUseCase } from '@application/use-cases/appointment/CreateAppointmentUseCase';
import { GetAllAppointmentUseCase } from '@application/use-cases/appointment/GetAllAppointmentUseCase';
import { GetAppointmentByIdUseCase } from '@application/use-cases/appointment/GetAppointmentByIdUseCase';
import { PrismaAppointmentRepository } from '@infrastructure/repositories/PrismaAppointmentRepository';

const commandHandlers = [CreateAppointmentUseCase];
const queryHandlers = [GetAllAppointmentUseCase, GetAppointmentByIdUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [AppointmentController],
  providers: [
    AppointmentService,
    ...commandHandlers,
    ...queryHandlers,
    { provide: 'AppointmentRepository', useClass: PrismaAppointmentRepository },
  ],
  exports: ['AppointmentRepository', ...commandHandlers, ...queryHandlers],
})
export class AppointmentModule {}
