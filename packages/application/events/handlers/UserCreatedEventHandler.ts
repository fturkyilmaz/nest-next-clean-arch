import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../UserCreatedEvent';
import { Logger } from '@nestjs/common';

@EventsHandler(UserCreatedEvent)
export class UserCreatedEventHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedEventHandler.name);

  async handle(event: UserCreatedEvent) {
    this.logger.log(
      `User created: ${event.email} (${event.role}) - ID: ${event.userId}`
    );

    // Here you can:
    // - Send welcome email
    // - Create audit log entry
    // - Trigger analytics event
    // - Initialize user preferences
    // - Send notification to admin
  }
}
