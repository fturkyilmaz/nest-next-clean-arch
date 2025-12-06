import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllUsersQuery } from './GetAllUsersQuery';
import { IUserRepository } from '@application/interfaces/IUserRepository';
import { User } from '@domain/entities/User.entity';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: GetAllUsersQuery): Promise<User[]> {
    return await this.userRepository.findAll({
      role: query.role,
      isActive: query.isActive,
      skip: query.skip,
      take: query.take,
    });
  }
}
