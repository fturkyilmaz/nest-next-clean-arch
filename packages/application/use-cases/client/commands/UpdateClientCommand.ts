import { ICommand } from '@nestjs/cqrs';

export class UpdateClientCommand implements ICommand {
  constructor(
    public readonly clientId: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly phone?: string,
    public readonly dateOfBirth?: Date,
    public readonly gender?: string,
    public readonly allergies?: string[],
    public readonly conditions?: string[],
    public readonly medications?: string[],
    public readonly notes?: string
  ) {}
}
