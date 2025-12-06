import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';
import { IUserRepository } from '../../application/interfaces/IUserRepository';
import { User, UserRole } from '../../domain/entities/User.entity';
import { Email } from '../../domain/value-objects/Email.vo';
import { Password } from '../../domain/value-objects/Password.vo';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findAll(filters?: {
    role?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        role: filters?.role as any,
        isActive: filters?.isActive,
        deletedAt: null, // Exclude soft deleted
      },
      skip: filters?.skip,
      take: filters?.take,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.toDomain(user));
  }

  async count(filters?: { role?: string; isActive?: boolean }): Promise<number> {
    return await this.prisma.user.count({
      where: {
        role: filters?.role as any,
        isActive: filters?.isActive,
        deletedAt: null,
      },
    });
  }

  async create(user: User): Promise<User> {
    const data = this.toPersistence(user);

    const created = await this.prisma.user.create({
      data,
    });

    return this.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const data = this.toPersistence(user);

    const updated = await this.prisma.user.update({
      where: { id: user.getId() },
      data,
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    return count > 0;
  }

  // Mapper methods
  private toDomain(raw: any): User {
    return User.reconstitute({
      id: raw.id,
      email: Email.create(raw.email),
      password: Password.createFromHash(raw.password),
      firstName: raw.firstName,
      lastName: raw.lastName,
      role: raw.role as UserRole,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  private toPersistence(user: User): any {
    return {
      id: user.getId() || undefined,
      email: user.getEmail().getValue(),
      password: user.getPassword().getValue(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      role: user.getRole(),
      isActive: user.isActive(),
      updatedAt: user.getUpdatedAt(),
      deletedAt: user.getDeletedAt(),
    };
  }
}
