import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetClientsByDietitianQuery } from './GetClientsByDietitianQuery';
import { IClientRepository } from '@application/interfaces/IClientRepository';
import { Client } from '@domain/entities/Client.entity';

@QueryHandler(GetClientsByDietitianQuery)
export class GetClientsByDietitianQueryHandler
  implements IQueryHandler<GetClientsByDietitianQuery>
{
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(query: GetClientsByDietitianQuery): Promise<Client[]> {
    return await this.clientRepository.findByDietitianId(query.dietitianId, {
      isActive: query.isActive,
      skip: query.skip,
      take: query.take,
    });
  }
}
