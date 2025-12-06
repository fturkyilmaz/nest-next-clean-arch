import { Client } from '@domain/entities/Client.entity';
import { ClientMetrics } from '@domain/entities/ClientMetrics.entity';
import { DietPlan } from '@domain/entities/DietPlan.entity';
import { Result, BusinessRuleError } from '@domain/common/Result';

/**
 * Client Aggregate Root
 * Ensures consistency boundary for client and related entities
 */
export class ClientAggregate {
  private constructor(
    private readonly client: Client,
    private readonly metrics: ClientMetrics[],
    private readonly dietPlans: DietPlan[]
  ) {}

  public static create(
    client: Client,
    metrics: ClientMetrics[] = [],
    dietPlans: DietPlan[] = []
  ): ClientAggregate {
    return new ClientAggregate(client, metrics, dietPlans);
  }

  // Getters
  public getClient(): Client {
    return this.client;
  }

  public getMetrics(): ClientMetrics[] {
    return [...this.metrics];
  }

  public getDietPlans(): DietPlan[] {
    return [...this.dietPlans];
  }

  public getLatestMetrics(): ClientMetrics | null {
    if (this.metrics.length === 0) return null;
    
    return this.metrics.reduce((latest, current) => {
      return current.getRecordedAt() > latest.getRecordedAt() ? current : latest;
    });
  }

  public getActiveDietPlan(): DietPlan | null {
    return this.dietPlans.find((plan) => plan.getStatus() === 'ACTIVE') || null;
  }

  // Business logic
  public canAssignDietPlan(): Result<boolean, BusinessRuleError> {
    const latestMetrics = this.getLatestMetrics();
    
    if (!latestMetrics) {
      return Result.fail(
        new BusinessRuleError('Cannot assign diet plan without health metrics')
      );
    }

    const activePlan = this.getActiveDietPlan();
    if (activePlan) {
      return Result.fail(
        new BusinessRuleError('Client already has an active diet plan')
      );
    }

    return Result.ok(true);
  }

  public addMetrics(metrics: ClientMetrics): void {
    this.metrics.push(metrics);
  }

  public assignDietPlan(dietPlan: DietPlan): Result<void, BusinessRuleError> {
    const canAssign = this.canAssignDietPlan();
    
    if (canAssign.isFailure()) {
      return Result.fail(canAssign.getError());
    }

    this.dietPlans.push(dietPlan);
    return Result.ok(undefined);
  }

  public getProgressSummary(): {
    totalMetrics: number;
    totalDietPlans: number;
    currentBMI: number | null;
    hasActivePlan: boolean;
  } {
    const latestMetrics = this.getLatestMetrics();
    
    return {
      totalMetrics: this.metrics.length,
      totalDietPlans: this.dietPlans.length,
      currentBMI: latestMetrics?.getBMI() || null,
      hasActivePlan: this.getActiveDietPlan() !== null,
    };
  }
}
