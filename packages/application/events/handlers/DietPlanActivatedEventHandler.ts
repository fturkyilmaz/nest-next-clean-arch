import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DietPlanActivatedEvent } from '../DietPlanActivatedEvent';
import { Logger } from '@nestjs/common';

@EventsHandler(DietPlanActivatedEvent)
export class DietPlanActivatedEventHandler
  implements IEventHandler<DietPlanActivatedEvent>
{
  private readonly logger = new Logger(DietPlanActivatedEventHandler.name);

  async handle(event: DietPlanActivatedEvent) {
    this.logger.log(
      `Diet plan activated: ${event.dietPlanId} for client: ${event.clientId}`
    );

    if (event.previousActivePlanId) {
      this.logger.log(
        `Previous plan ${event.previousActivePlanId} was automatically completed`
      );
    }

    // Here you can:
    // - Send notification to client
    // - Notify dietitian
    // - Schedule follow-up appointments
    // - Create meal plan reminders
    // - Update client dashboard
  }
}
