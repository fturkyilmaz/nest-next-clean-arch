import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoryModule } from '@infrastructure/repositories/RepositoryModule';
import { ClientController } from './client.controller';
import {
  CreateClientCommandHandler,
  UpdateClientCommandHandler,
  GetClientsByDietitianQueryHandler,
  SearchClientsQueryHandler,
} from '@application/use-cases/client';

const CommandHandlers = [CreateClientCommandHandler, UpdateClientCommandHandler];
const QueryHandlers = [GetClientsByDietitianQueryHandler, SearchClientsQueryHandler];

@Module({
  imports: [CqrsModule, RepositoryModule],
  controllers: [ClientController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ClientModule {}
