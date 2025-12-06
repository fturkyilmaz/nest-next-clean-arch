import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from './GetUserByIdQuery';
import { IUserRepository } from '@application/interfaces/IUserRepository';
import { User } from '@domain/entities/User.entity';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: GetUserByIdQuery): Promise<User | null> {
    const user = await this.userRepository.findById(query.userId);
    
    if (!user) {
      return null;
    }

    // Check if user is soft deleted
    if (user.getDeletedAt()) {
      return null;
    }

    return user;
  }
}
