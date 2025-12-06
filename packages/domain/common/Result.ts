/**
 * Result Type for Railway-Oriented Programming
 * Eliminates exception throwing in domain layer
 */
export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  public static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  public static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  public isSuccess(): boolean {
    return this._isSuccess;
  }

  public isFailure(): boolean {
    return !this._isSuccess;
  }

  public getValue(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value!;
  }

  public getError(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error!;
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure()) {
      return Result.fail<U, E>(this._error!);
    }
    return Result.ok<U, E>(fn(this._value!));
  }

  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure()) {
      return Result.fail<U, E>(this._error!);
    }
    return fn(this._value!);
  }

  public mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess()) {
      return Result.ok<T, F>(this._value!);
    }
    return Result.fail<T, F>(fn(this._error!));
  }

  public match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    return this.isSuccess() ? onSuccess(this._value!) : onFailure(this._error!);
  }

  public getOrElse(defaultValue: T): T {
    return this.isSuccess() ? this._value! : defaultValue;
  }

  public getOrThrow(): T {
    if (this.isFailure()) {
      throw this._error;
    }
    return this._value!;
  }
}

/**
 * Domain Error base class
 */
export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly metadata?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific domain errors
 */
export class ValidationError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', metadata);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`, 'NOT_FOUND', { entity, id });
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 'CONFLICT', metadata);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 'BUSINESS_RULE_VIOLATION', metadata);
  }
}
