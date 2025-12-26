import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserCommand } from './UpdateUserCommand';
import { IUserRepository } from '@application/interfaces/repositories/common/IUserRepository';
import { User } from '@domain/entities/User.entity';
import { Email } from '@domain/value-objects/Email.vo';
import { BusinessRuleError, NotFoundError } from '@domain/common/Result';

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository
  ) { }

  async execute(command: UpdateUserCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new NotFoundError('User not found', command.userId);
    }

    if (command.email) {
      const newEmail = Email.create(command.email);
      const existingUser = await this.userRepository.findByEmail(command.email);

      if (existingUser && existingUser.getId() !== command.userId) {
        throw new BusinessRuleError('Email is already taken by another user');
      }

      if (newEmail.isSuccess()) {
        user.updateEmail(newEmail.getValue());
      }
    }

    if (command.firstName || command.lastName) {
      user.updateProfile(
        command.firstName ?? user.getFirstName(),
        command.lastName ?? user.getLastName()
      );
    }

    return await this.userRepository.update(user);
  }
}
