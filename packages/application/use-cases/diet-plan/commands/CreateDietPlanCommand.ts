import { ICommand } from '@nestjs/cqrs';

export interface NutritionalGoals {
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  targetFiber?: number;
}

export class CreateDietPlanCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly clientId: string,
    public readonly dietitianId: string,
    public readonly startDate: Date,
    public readonly description?: string,
    public readonly endDate?: Date,
    public readonly nutritionalGoals?: NutritionalGoals
  ) {}
}
