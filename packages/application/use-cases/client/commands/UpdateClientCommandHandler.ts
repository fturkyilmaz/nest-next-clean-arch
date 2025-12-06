import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateClientCommand } from './UpdateClientCommand';
import { IClientRepository } from '@application/interfaces/IClientRepository';
import { Client, Gender } from '@domain/entities/Client.entity';

@CommandHandler(UpdateClientCommand)
export class UpdateClientCommandHandler implements ICommandHandler<UpdateClientCommand> {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(command: UpdateClientCommand): Promise<Client> {
    // Find client
    const client = await this.clientRepository.findById(command.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Update profile if provided
    client.updateProfile({
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone,
      dateOfBirth: command.dateOfBirth,
      gender: command.gender as Gender,
    });

    // Update notes if provided
    if (command.notes !== undefined) {
      client.updateNotes(command.notes);
    }

    // Note: For allergies, conditions, medications, we would need separate commands
    // to add/remove individual items to maintain proper domain logic

    // Save to repository
    return await this.clientRepository.update(client);
  }
}
