import { IQuery } from '@nestjs/cqrs';

export class GetClientsByDietitianQuery implements IQuery {
  constructor(
    public readonly dietitianId: string,
    public readonly isActive?: boolean,
    public readonly skip?: number,
    public readonly take?: number
  ) {}
}
