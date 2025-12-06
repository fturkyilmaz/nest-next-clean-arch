import { Injectable } from '@nestjs/common';

@Injectable()
export class DietPlanService {
  private plans = [];

  findAll() {
    return this.plans;
  }

  create(dto: { clientId: string; meals: any[] }) {
    const plan = { id: `dp_${Date.now()}`, ...dto };
    this.plans.push(plan);
    return plan;
  }
}
