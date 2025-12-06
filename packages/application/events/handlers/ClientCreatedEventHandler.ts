import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ClientCreatedEvent } from '../ClientCreatedEvent';
import { Logger } from '@nestjs/common';

@EventsHandler(ClientCreatedEvent)
export class ClientCreatedEventHandler implements IEventHandler<ClientCreatedEvent> {
  private readonly logger = new Logger(ClientCreatedEventHandler.name);

  async handle(event: ClientCreatedEvent) {
    this.logger.log(
      `Client created: ${event.email} - Dietitian: ${event.dietitianId}`
    );

    // Here you can:
    // - Send welcome email to client
    // - Notify assigned dietitian
    // - Create initial health metrics record
    // - Schedule first appointment
    // - Send onboarding materials
  }
}
