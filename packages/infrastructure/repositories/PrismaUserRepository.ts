import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';
import { PrismaRepositoryBase } from './PrismaRepositoryBase';
import { User } from '@domain/entities/User.entity';
import { User as PrismaUser,Role as UserRole } from '@prisma/client'; // Prisma enum'u da import et
import { Email } from '@domain/value-objects/Email.vo';
import { Password } from '@domain/value-objects/Password.vo';
import { IUserRepository } from '@application/interfaces/IUserRepository';
import { Prisma } from 'prisma/generated/prisma/client';

@Injectable()
export class PrismaUserRepository
  extends PrismaRepositoryBase<PrismaUser, User, string>
  implements IUserRepository
{
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
      role: model.role as UserRole, // Prisma enum ile uyumlu hale getir
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
      role: domain.getRole() as UserRole,
      isActive: domain.isActive(),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const model = await this.prisma.user.findUnique({
      where: { email },
    });
    return model ? this.toDomain(model) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const model = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!model;
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }
}
