import { IQuery } from '@nestjs/cqrs';

export class GetClientsByIdQuery implements IQuery {
  constructor(
    public readonly id: string,
    public readonly isActive?: boolean,
    public readonly skip?: number,
    public readonly take?: number
  ) { }
}
