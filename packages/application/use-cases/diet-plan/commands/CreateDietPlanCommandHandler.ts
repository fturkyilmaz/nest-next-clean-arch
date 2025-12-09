import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateDietPlanCommand } from './CreateDietPlanCommand';
import { IDietPlanRepository } from '@application/interfaces/IDietPlanRepository';
import { DietPlan, DietPlanStatus } from '@domain/entities/DietPlan.entity';
import { DateRange } from '@domain/value-objects/DateRange.vo';

@CommandHandler(CreateDietPlanCommand)
export class CreateDietPlanCommandHandler
  implements ICommandHandler<CreateDietPlanCommand> {
  constructor(
    @Inject('IDietPlanRepository') private readonly dietPlanRepository: IDietPlanRepository
  ) { }

  async execute(command: CreateDietPlanCommand): Promise<DietPlan> {
    // Create date range
    const dateRange = DateRange.create(command.startDate, command.endDate);

    // Create diet plan entity
    const dietPlan = DietPlan.create({
      name: command.name,
      description: command.description,
      clientId: command.clientId,
      dietitianId: command.dietitianId,
      dateRange,
      status: DietPlanStatus.DRAFT,
      nutritionalGoals: command.nutritionalGoals || {},
      isActive: true,
    });

    // Save to repository
    return await this.dietPlanRepository.create(dietPlan);
  }
}
