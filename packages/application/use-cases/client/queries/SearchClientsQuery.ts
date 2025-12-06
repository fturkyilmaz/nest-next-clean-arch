import { IQuery } from '@nestjs/cqrs';

export class SearchClientsQuery implements IQuery {
  constructor(
    public readonly searchTerm: string,
    public readonly dietitianId?: string,
    public readonly skip?: number,
    public readonly take?: number
  ) {}
}
