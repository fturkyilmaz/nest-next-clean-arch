import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';
import { PrismaRepositoryBase } from './PrismaRepositoryBase';
import { User } from '@domain/entities/User.entity';
import { User as PrismaUser } from '@prisma/client';
import { Email } from '@domain/value-objects/Email.vo';
import { Password } from '@domain/value-objects/Password.vo';
import { IUserRepository } from '@application/interfaces/IUserRepository';
import { UserByEmailSpec } from '@application/interfaces/repositories/common/IRepositorySpecification';
import { Prisma } from 'prisma/generated/prisma/client';

/**
 * User Repository using Generic Base
 */
@Injectable()
export class PrismaUserRepository extends PrismaRepositoryBase<PrismaUser, User, string> implements IUserRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  protected toDomain(model: PrismaUser): User {
    const emailResult = Email.create(model.email);
    const email = emailResult.isSuccess() ? emailResult.getValue() : null;

    return User.reconstitute({
      id: model.id,
      email: email!,
      password: Password.fromHash(model.password),
      firstName: model.firstName,
      lastName: model.lastName,
      role: model.role,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  protected toPrisma(domain: User): Prisma.UserCreateInput | Prisma.UserUpdateInput {
    return {
      id: domain.getId(),
      email: domain.getEmail().getValue(),
      password: domain.getPassword().getValue(),
      firstName: domain.getFirstName(),
      lastName: domain.getLastName(),
      role: domain.getRole(),
      isActive: domain.isActive(),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne(new UserByEmailSpec(email));
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.exists(new UserByEmailSpec(email));
  }
}
