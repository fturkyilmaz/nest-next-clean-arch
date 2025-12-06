import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';
import { PrismaRepositoryBase } from './PrismaRepositoryBase';
import { User } from '@domain/entities/User.entity';
import { Email } from '@domain/value-objects/Email.vo';
import { Password } from '@domain/value-objects/Password.vo';

/**
 * User Repository using Generic Base
 */
@Injectable()
export class PrismaUserRepository extends PrismaRepositoryBase<any, User, string> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  protected toDomain(model: any): User {
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

  protected toPrisma(domain: User): any {
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

  // Custom methods specific to User
  async findByEmail(email: string): Promise<User | null> {
    const model = await this.model.findUnique({ where: { email } });
    return model ? this.toDomain(model) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.model.count({ where: { email } });
    return count > 0;
  }
}
