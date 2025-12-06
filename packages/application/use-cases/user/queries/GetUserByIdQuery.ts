import { IQuery } from '@nestjs/cqrs';

export class GetUserByIdQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
