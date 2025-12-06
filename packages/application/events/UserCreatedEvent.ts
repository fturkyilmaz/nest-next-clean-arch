import { IEvent } from '@nestjs/cqrs';

export class UserCreatedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly role: string,
    public readonly firstName: string,
    public readonly lastName: string
  ) {}
}
