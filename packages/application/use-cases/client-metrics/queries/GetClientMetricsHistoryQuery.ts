import { IQuery } from '@nestjs/cqrs';

export class GetClientMetricsHistoryQuery implements IQuery {
  constructor(
    public readonly clientId: string,
    public readonly skip?: number,
    public readonly take?: number
  ) {}
}
