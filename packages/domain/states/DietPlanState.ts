/**
 * State Pattern - State Transitions
 * Allows object to change behavior when internal state changes
 */

import { Result, BusinessRuleError } from '@domain/common/Result';

/**
 * State Interface
 */
export interface IState<T> {
  activate(context: T): Result<void, BusinessRuleError>;
  complete(context: T): Result<void, BusinessRuleError>;
  cancel(context: T): Result<void, BusinessRuleError>;
  pause(context: T): Result<void, BusinessRuleError>;
  resume(context: T): Result<void, BusinessRuleError>;
}

/**
 * Abstract State Base
 */
export abstract class DietPlanState implements IState<any> {
  activate(context: any): Result<void, BusinessRuleError> {
    return Result.fail(
      new BusinessRuleError(`Cannot activate from ${this.constructor.name}`)
    );
  }

  complete(context: any): Result<void, BusinessRuleError> {
    return Result.fail(
      new BusinessRuleError(`Cannot complete from ${this.constructor.name}`)
    );
  }

  cancel(context: any): Result<void, BusinessRuleError> {
    return Result.fail(
      new BusinessRuleError(`Cannot cancel from ${this.constructor.name}`)
    );
  }

  pause(context: any): Result<void, BusinessRuleError> {
    return Result.fail(
      new BusinessRuleError(`Cannot pause from ${this.constructor.name}`)
    );
  }

  resume(context: any): Result<void, BusinessRuleError> {
    return Result.fail(
      new BusinessRuleError(`Cannot resume from ${this.constructor.name}`)
    );
  }

  abstract getName(): string;
}

/**
 * Draft State
 */
export class DraftState extends DietPlanState {
  activate(context: any): Result<void, BusinessRuleError> {
    context.setState(new ActiveState());
    context.status = 'ACTIVE';
    return Result.ok(undefined);
  }

  cancel(context: any): Result<void, BusinessRuleError> {
    context.setState(new CancelledState());
    context.status = 'CANCELLED';
    return Result.ok(undefined);
  }

  getName(): string {
    return 'DRAFT';
  }
}

/**
 * Active State
 */
export class ActiveState extends DietPlanState {
  complete(context: any): Result<void, BusinessRuleError> {
    context.setState(new CompletedState());
    context.status = 'COMPLETED';
    return Result.ok(undefined);
  }

  pause(context: any): Result<void, BusinessRuleError> {
    context.setState(new PausedState());
    context.status = 'PAUSED';
    return Result.ok(undefined);
  }

  cancel(context: any): Result<void, BusinessRuleError> {
    context.setState(new CancelledState());
    context.status = 'CANCELLED';
    return Result.ok(undefined);
  }

  getName(): string {
    return 'ACTIVE';
  }
}

/**
 * Paused State
 */
export class PausedState extends DietPlanState {
  resume(context: any): Result<void, BusinessRuleError> {
    context.setState(new ActiveState());
    context.status = 'ACTIVE';
    return Result.ok(undefined);
  }

  cancel(context: any): Result<void, BusinessRuleError> {
    context.setState(new CancelledState());
    context.status = 'CANCELLED';
    return Result.ok(undefined);
  }

  getName(): string {
    return 'PAUSED';
  }
}

/**
 * Completed State
 */
export class CompletedState extends DietPlanState {
  getName(): string {
    return 'COMPLETED';
  }
}

/**
 * Cancelled State
 */
export class CancelledState extends DietPlanState {
  getName(): string {
    return 'CANCELLED';
  }
}

/**
 * Context - Diet Plan with State
 */
export class StatefulDietPlan {
  private state: DietPlanState;
  public status: string;

  constructor(
    public readonly id: string,
    public readonly name: string,
    initialStatus: string = 'DRAFT'
  ) {
    this.status = initialStatus;
    this.state = this.getStateFromStatus(initialStatus);
  }

  private getStateFromStatus(status: string): DietPlanState {
    switch (status) {
      case 'DRAFT':
        return new DraftState();
      case 'ACTIVE':
        return new ActiveState();
      case 'PAUSED':
        return new PausedState();
      case 'COMPLETED':
        return new CompletedState();
      case 'CANCELLED':
        return new CancelledState();
      default:
        return new DraftState();
    }
  }

  setState(state: DietPlanState): void {
    this.state = state;
  }

  getState(): DietPlanState {
    return this.state;
  }

  // Delegate to state
  activate(): Result<void, BusinessRuleError> {
    return this.state.activate(this);
  }

  complete(): Result<void, BusinessRuleError> {
    return this.state.complete(this);
  }

  cancel(): Result<void, BusinessRuleError> {
    return this.state.cancel(this);
  }

  pause(): Result<void, BusinessRuleError> {
    return this.state.pause(this);
  }

  resume(): Result<void, BusinessRuleError> {
    return this.state.resume(this);
  }

  getStatus(): string {
    return this.status;
  }
}

/**
 * Usage:
 * 
 * const dietPlan = new StatefulDietPlan('123', 'Weight Loss Plan');
 * 
 * // DRAFT → ACTIVE
 * const activateResult = dietPlan.activate();
 * if (activateResult.isSuccess()) {
 *   console.log('Plan activated');
 * }
 * 
 * // ACTIVE → PAUSED
 * dietPlan.pause();
 * 
 * // PAUSED → ACTIVE
 * dietPlan.resume();
 * 
 * // ACTIVE → COMPLETED
 * dietPlan.complete();
 * 
 * // Try invalid transition
 * const result = dietPlan.activate(); // Fails - can't activate from COMPLETED
 * if (result.isFailure()) {
 *   console.log(result.getError().message);
 * }
 */
