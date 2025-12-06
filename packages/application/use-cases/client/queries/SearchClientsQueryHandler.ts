import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { SearchClientsQuery } from './SearchClientsQuery';
import { IClientRepository } from '@application/interfaces/IClientRepository';
import { Client } from '@domain/entities/Client.entity';

@QueryHandler(SearchClientsQuery)
export class SearchClientsQueryHandler implements IQueryHandler<SearchClientsQuery> {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(query: SearchClientsQuery): Promise<Client[]> {
    return await this.clientRepository.search(query.searchTerm, query.dietitianId, {
      skip: query.skip,
      take: query.take,
    });
  }
}
