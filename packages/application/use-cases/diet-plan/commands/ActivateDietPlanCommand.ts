import { ICommand } from '@nestjs/cqrs';

export class ActivateDietPlanCommand implements ICommand {
  constructor(public readonly dietPlanId: string) {}
}
