import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoryModule } from '@infrastructure/repositories/RepositoryModule';
import { UserController } from './user.controller';
import {
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  GetUserByIdQueryHandler,
  GetAllUsersQueryHandler,
} from '@application/use-cases/user';

const CommandHandlers = [CreateUserCommandHandler, UpdateUserCommandHandler];
const QueryHandlers = [GetUserByIdQueryHandler, GetAllUsersQueryHandler];

@Module({
  imports: [CqrsModule, RepositoryModule],
  controllers: [UserController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class UserModule {}
