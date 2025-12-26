import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetUserByIdQuery } from './GetUserByIdQuery';
import { IUserRepository } from '@application/interfaces/repositories/common/IUserRepository';
import { User } from '@domain/entities/User.entity';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository
  ) { }

  async execute(query: GetUserByIdQuery): Promise<User> {
    const user = await this.userRepository.findById(query.userId);

    if (!user) throw new NotFoundException('User not found');

    if (user.getDeletedAt()) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
