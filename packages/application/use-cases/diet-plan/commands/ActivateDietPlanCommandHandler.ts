import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActivateDietPlanCommand } from './ActivateDietPlanCommand';
import { IDietPlanRepository } from '@application/interfaces/IDietPlanRepository';
import { DietPlan } from '@domain/entities/DietPlan.entity';

@CommandHandler(ActivateDietPlanCommand)
export class ActivateDietPlanCommandHandler
  implements ICommandHandler<ActivateDietPlanCommand>
{
  constructor(private readonly dietPlanRepository: IDietPlanRepository) {}

  async execute(command: ActivateDietPlanCommand): Promise<DietPlan> {
    // Find diet plan
    const dietPlan = await this.dietPlanRepository.findById(command.dietPlanId);
    if (!dietPlan) {
      throw new Error('Diet plan not found');
    }

    // Check if there's already an active plan for this client
    const activePlan = await this.dietPlanRepository.findActiveByClientId(
      dietPlan.getClientId()
    );

    if (activePlan && activePlan.getId() !== command.dietPlanId) {
      // Deactivate the current active plan
      activePlan.complete();
      await this.dietPlanRepository.update(activePlan);
    }

    // Activate the new plan
    dietPlan.activate();

    // Save to repository
    return await this.dietPlanRepository.update(dietPlan);
  }
}
