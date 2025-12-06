import { Result, ValidationError } from '@domain/common/Result';

export interface IRequestHandler<TRequest, TResponse> {
  setNext(handler: IRequestHandler<TRequest, TResponse>): IRequestHandler<TRequest, TResponse>;
  handle(request: TRequest): Promise<Result<TResponse, ValidationError>>;
}

export abstract class AbstractRequestHandler<TRequest, TResponse>
  implements IRequestHandler<TRequest, TResponse>
{
  private nextHandler?: IRequestHandler<TRequest, TResponse>;

  setNext(handler: IRequestHandler<TRequest, TResponse>): IRequestHandler<TRequest, TResponse> {
    this.nextHandler = handler;
    return handler;
  }

  async handle(request: TRequest): Promise<Result<TResponse, ValidationError>> {
    const result = await this.process(request);

    if (result.isFailure() || !this.nextHandler) {
      return result;
    }

    return this.nextHandler.handle(request);
  }

  protected abstract process(request: TRequest): Promise<Result<TResponse, ValidationError>>;
}

/**
 * Example: Diet Plan Validation Chain
 */

interface DietPlanRequest {
  clientId: string;
  startDate: Date;
  endDate: Date;
  targetCalories: number;
}

/**
 * Date Validation Handler
 */
export class DateValidationHandler extends AbstractRequestHandler<DietPlanRequest, boolean> {
  protected async process(request: DietPlanRequest): Promise<Result<boolean, ValidationError>> {
    if (request.endDate <= request.startDate) {
      return Result.fail(
        new ValidationError('End date must be after start date')
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (request.startDate < today) {
      return Result.fail(
        new ValidationError('Start date cannot be in the past')
      );
    }

    return Result.ok(true);
  }
}

/**
 * Calorie Validation Handler
 */
export class CalorieValidationHandler extends AbstractRequestHandler<DietPlanRequest, boolean> {
  protected async process(request: DietPlanRequest): Promise<Result<boolean, ValidationError>> {
    if (request.targetCalories < 1200) {
      return Result.fail(
        new ValidationError('Target calories must be at least 1200')
      );
    }

    if (request.targetCalories > 5000) {
      return Result.fail(
        new ValidationError('Target calories must not exceed 5000')
      );
    }

    return Result.ok(true);
  }
}

/**
 * Client Active Plan Handler
 */
export class ClientActivePlanHandler extends AbstractRequestHandler<DietPlanRequest, boolean> {
  constructor(private checkActivePlan: (clientId: string) => Promise<boolean>) {
    super();
  }

  protected async process(request: DietPlanRequest): Promise<Result<boolean, ValidationError>> {
    const hasActivePlan = await this.checkActivePlan(request.clientId);

    if (hasActivePlan) {
      return Result.fail(
        new ValidationError('Client already has an active diet plan')
      );
    }

    return Result.ok(true);
  }
}

/**
 * Usage:
 * 
 * const dateHandler = new DateValidationHandler();
 * const calorieHandler = new CalorieValidationHandler();
 * const activePlanHandler = new ClientActivePlanHandler(checkActivePlanFn);
 * 
 * // Build chain
 * dateHandler
 *   .setNext(calorieHandler)
 *   .setNext(activePlanHandler);
 * 
 * // Process request
 * const result = await dateHandler.handle({
 *   clientId: '123',
 *   startDate: new Date(),
 *   endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
 *   targetCalories: 2000,
 * });
 * 
 * if (result.isSuccess()) {
 *   // All validations passed
 * }
 */
