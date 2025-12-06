import { IEvent } from '@nestjs/cqrs';

export class DietPlanActivatedEvent implements IEvent {
  constructor(
    public readonly dietPlanId: string,
    public readonly clientId: string,
    public readonly dietitianId: string,
    public readonly previousActivePlanId?: string
  ) {}
}
