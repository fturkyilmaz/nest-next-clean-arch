import { Controller, Get } from '@nestjs/common';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly service: EventService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
