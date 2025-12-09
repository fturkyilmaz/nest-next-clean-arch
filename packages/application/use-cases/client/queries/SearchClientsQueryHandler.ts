import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SearchClientsQuery } from './SearchClientsQuery';
import { IClientRepository } from '@application/interfaces/IClientRepository';
import { Client } from '@domain/entities/Client.entity';

@QueryHandler(SearchClientsQuery)
export class SearchClientsQueryHandler implements IQueryHandler<SearchClientsQuery> {
  constructor(
    @Inject('IClientRepository') private readonly clientRepository: IClientRepository
  ) { }

  async execute(query: SearchClientsQuery): Promise<Client[]> {
    return await this.clientRepository.search(query.searchTerm, query.dietitianId, {
      skip: query.skip,
      take: query.take,
    });
  }
}
