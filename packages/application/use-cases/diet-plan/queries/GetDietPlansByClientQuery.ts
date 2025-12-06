import { IQuery } from '@nestjs/cqrs';

export class GetDietPlansByClientQuery implements IQuery {
  constructor(
    public readonly clientId: string,
    public readonly status?: string,
    public readonly isActive?: boolean,
    public readonly skip?: number,
    public readonly take?: number
  ) {}
}
