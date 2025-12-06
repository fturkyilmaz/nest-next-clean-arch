import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from './UpdateUserCommand';
import { IUserRepository } from '@application/interfaces/IUserRepository';
import { User } from '@domain/entities/User.entity';
import { Email } from '@domain/value-objects/Email.vo';

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    // Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update email if provided
    if (command.email) {
      const newEmail = Email.create(command.email);
      
      // Check if new email is already taken by another user
      const existingUser = await this.userRepository.findByEmail(command.email);
      if (existingUser && existingUser.getId() !== command.userId) {
        throw new Error('Email is already taken by another user');
      }
      
      if (newEmail.isSuccess()) { user.updateEmail(newEmail.getValue()); }
    }

    // Update profile if provided
    if (command.firstName || command.lastName) {
      user.updateProfile(
        command.firstName || user.getFirstName(),
        command.lastName || user.getLastName()
      );
    }

    // Save to repository
    return await this.userRepository.update(user);
  }
}
