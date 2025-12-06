import { IEvent } from '@nestjs/cqrs';

export class ClientCreatedEvent implements IEvent {
  constructor(
    public readonly clientId: string,
    public readonly dietitianId: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string
  ) {}
}
