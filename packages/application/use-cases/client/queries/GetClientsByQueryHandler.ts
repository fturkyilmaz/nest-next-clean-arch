import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IClientRepository } from '@application/interfaces/repositories/IClientRepository';
import { Client } from '@domain/entities/Client.entity';
import { GetClientsByIdQuery } from './GetClientsByIdQuery';

@QueryHandler(GetClientsByIdQuery)
export class GetClientsByDietitianQueryHandler
  implements IQueryHandler<GetClientsByIdQuery> {
  constructor(
    @Inject('IClientRepository') private readonly clientRepository: IClientRepository
  ) { }

  async execute(query: GetClientsByIdQuery): Promise<Client[]> {
    return await this.clientRepository.findByDietitianId(query.dietitianId, {
      isActive: query.isActive,
      skip: query.skip,
      take: query.take,
    });
  }
}
