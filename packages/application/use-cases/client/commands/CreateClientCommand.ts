import { ICommand } from '@nestjs/cqrs';

export class CreateClientCommand implements ICommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly dietitianId: string,
    public readonly phone?: string,
    public readonly dateOfBirth?: Date,
    public readonly gender?: string,
    public readonly allergies?: string[],
    public readonly conditions?: string[],
    public readonly medications?: string[],
    public readonly notes?: string
  ) {}
}
