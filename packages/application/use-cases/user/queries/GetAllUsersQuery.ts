import { IQuery } from '@nestjs/cqrs';

export class GetAllUsersQuery implements IQuery {
  constructor(
    public readonly role?: string,
    public readonly isActive?: boolean,
    public readonly skip?: number,
    public readonly take?: number
  ) {}
}
