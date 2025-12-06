import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserCommand } from './CreateUserCommand';
import { User } from '@domain/entities/User.entity';
import { Email } from '@domain/value-objects/Email.vo';
import { Password } from '@domain/value-objects/Password.vo';
import { Result, ConflictError, ValidationError } from '@domain/common/Result';
import { IUserRepository } from '@application/interfaces/IUserRepository';
import { IPasswordHasher } from '@application/interfaces/services/IPasswordHasher';

/**
 * Enhanced CreateUserCommandHandler with Result type
 * No exceptions thrown - uses Railway-Oriented Programming
 */
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<User, ValidationError | ConflictError>> {
    // Validate email
    const emailResult = Email.create(command.email);
    if (emailResult.isFailure()) {
      return Result.fail(emailResult.getError());
    }

    // Validate password
    const passwordResult = Password.create(command.password);
    if (passwordResult.isFailure()) {
      return Result.fail(passwordResult.getError());
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      return Result.fail(
        new ConflictError(`User with email ${command.email} already exists`, {
          email: command.email,
        })
      );
    }

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(command.password);

    // Create user entity
    const user = User.create({
      email: emailResult.getValue(),
      password: Password.fromHash(hashedPassword),
      firstName: command.firstName,
      lastName: command.lastName,
      role: command.role as any,
      isActive: true,
    });

    // Persist user
    const savedUser = await this.userRepository.create(user);

    return Result.ok(savedUser);
  }
}
