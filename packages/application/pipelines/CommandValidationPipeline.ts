import { Injectable } from '@nestjs/common';
import { ICommand } from '@nestjs/cqrs';
import { Result, ValidationError } from '@domain/common/Result';
import { validate } from 'class-validator';

/**
 * Command Validation Pipeline
 * Centralized validation for all commands before execution
 */
@Injectable()
export class CommandValidationPipeline {
  /**
   * Validate command using class-validator decorators
   */
  async validate<T extends ICommand>(command: T): Promise<Result<void, ValidationError>> {
    const errors = await validate(command as any);

    if (errors.length > 0) {
      const validationErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
        value: error.value,
      }));

      return Result.fail(
        new ValidationError('Command validation failed', {
          errors: validationErrors,
        })
      );
    }

    return Result.ok(undefined);
  }

  /**
   * Validate and execute command
   */
  async validateAndExecute<T extends ICommand, R>(
    command: T,
    executor: (cmd: T) => Promise<R>
  ): Promise<Result<R, ValidationError>> {
    const validationResult = await this.validate(command);

    if (validationResult.isFailure()) {
      return Result.fail(validationResult.getError());
    }

    try {
      const result = await executor(command);
      return Result.ok(result);
    } catch (error) {
      return Result.fail(
        new ValidationError('Command execution failed', {
          error: error.message,
        })
      );
    }
  }
}

/**
 * Command Decorator for automatic validation
 */
export function ValidateCommand() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const command = args[0];
      const pipeline = new CommandValidationPipeline();

      const validationResult = await pipeline.validate(command);
      if (validationResult.isFailure()) {
        throw validationResult.getError();
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Usage:
 * 
 * @CommandHandler(CreateUserCommand)
 * export class CreateUserCommandHandler {
 *   @ValidateCommand()
 *   async execute(command: CreateUserCommand): Promise<User> {
 *     // Command is already validated
 *   }
 * }
 */
