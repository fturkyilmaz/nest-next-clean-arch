import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateClientCommand } from './CreateClientCommand';
import { IClientRepository } from '@application/interfaces/IClientRepository';
import { Client, Gender } from '@domain/entities/Client.entity';
import { Email } from '@domain/value-objects/Email.vo';

@CommandHandler(CreateClientCommand)
export class CreateClientCommandHandler implements ICommandHandler<CreateClientCommand> {
  constructor(
    @Inject('IClientRepository') private readonly clientRepository: IClientRepository
  ) { }

  async execute(command: CreateClientCommand): Promise<Client> {
    // Check if email already exists
    const existingClient = await this.clientRepository.findByEmail(command.email);
    if (existingClient) {
      throw new Error('Client with this email already exists');
    }

    // Create value objects
    const emailResult = Email.create(command.email);
    const email = emailResult.getValue();

    // Create client entity
    const client = Client.create({
      firstName: command.firstName,
      lastName: command.lastName,
      email,
      phone: command.phone,
      dateOfBirth: command.dateOfBirth,
      gender: command.gender as Gender,
      dietitianId: command.dietitianId,
      notes: command.notes,
      allergies: command.allergies || [],
      conditions: command.conditions || [],
      medications: command.medications || [],
      isActive: true,
    });

    // Add medical information if provided
    if (command.allergies) {
      command.allergies.forEach((allergy) => client.addAllergy(allergy));
    }

    if (command.conditions) {
      command.conditions.forEach((condition) => client.addCondition(condition));
    }

    if (command.medications) {
      command.medications.forEach((medication) => client.addMedication(medication));
    }

    // Save to repository
    return await this.clientRepository.create(client);
  }
}
