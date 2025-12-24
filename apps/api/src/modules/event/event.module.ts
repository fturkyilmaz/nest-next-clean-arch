import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventUseCase } from '@application/use-cases/event/CreateEventUseCase';
import { GetAllEventUseCase } from '@application/use-cases/event/GetAllEventUseCase';
import { GetEventByIdUseCase } from '@application/use-cases/event/GetEventByIdUseCase';
import { PrismaEventRepository } from '@infrastructure/repositories/PrismaEventRepository';

const commandHandlers = [CreateEventUseCase];
const queryHandlers = [GetAllEventUseCase, GetEventByIdUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [EventController],
  providers: [
    EventService,
    ...commandHandlers,
    ...queryHandlers,
    { provide: 'EventRepository', useClass: PrismaEventRepository },
  ],
  exports: ['EventRepository', ...commandHandlers, ...queryHandlers],
})
export class EventModule {}
