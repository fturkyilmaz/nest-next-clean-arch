import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/PrismaService';
import { CacheService } from '@infrastructure/cache/cache.service';
import { User, UserRole } from '@domain/entities/User.entity';
import { Email } from '@domain/value-objects/Email.vo';
import { Password } from '@domain/value-objects/Password.vo';
import { IUserRepository } from '@application/interfaces/repositories/common/IUserRepository';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) { }
  async create(user: User): Promise<User> {
    const data = this.toPrisma(user);
    const model = await this.prisma.user.upsert({
      where: { id: user.getId() },
      update: data,
      create: data,
    });
    
    // Invalidate cache for this user
    await this.cache.invalidateUserCache(user.getId());
    
    return this.toDomain(model);
  }

  async update(user: User): Promise<User> {
    const data = this.toPrisma(user);
    const model = await this.prisma.user.update({
      where: { id: user.getId() },
      data,
    });
    
    // Invalidate cache for this user
    await this.cache.invalidateUserCache(user.getId());
    
    return this.toDomain(model);
  }

  protected toDomain(model: any): User {
    const emailResult = Email.create(model.email);
    if (!emailResult.isSuccess()) {
      throw new Error(`Invalid email in database: ${model.email}`);
    }

    return User.reconstitute({
      id: model.id,
      email: emailResult.getValue(),
      password: Password.fromHash(model.password),
      firstName: model.firstName,
      lastName: model.lastName,
      role: model.role as UserRole,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    });
  }

  protected toPrisma(domain: User) {
    return {
      id: domain.getId(),
      email: domain.getEmail().getValue(),
      password: domain.getPassword().getValue(),
      firstName: domain.getFirstName(),
      lastName: domain.getLastName(),
      role: domain.getRole() as UserRole,
      isActive: domain.isActive(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
      deletedAt: domain.getDeletedAt() ?? null,
    };
  }

  async findById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;
    
    // Try to get from cache first
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) {
      return this.toDomain(cached);
    }

    // Query database
    const model = await this.prisma.user.findUnique({ where: { id } });
    
    if (model) {
      // Cache for 1 hour
      await this.cache.set(cacheKey, model, 3600);
      return this.toDomain(model);
    }
    
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:email:${email}`;
    
    // Try to get from cache first
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) {
      return this.toDomain(cached);
    }

    // Query database
    const model = await this.prisma.user.findUnique({ where: { email } });
    
    if (model) {
      // Cache for 1 hour
      await this.cache.set(cacheKey, model, 3600);
      return this.toDomain(model);
    }
    
    return null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const model = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!model;
  }

  async findAll(): Promise<User[]> {
    const models = await this.prisma.user.findMany({ where: { deletedAt: null } });
    return models.map((m) => this.toDomain(m));
  }

  async save(user: User): Promise<User> {
    const data = this.toPrisma(user);
    const model = await this.prisma.user.upsert({
      where: { id: user.getId() },
      update: data,
      create: data,
    });
    return this.toDomain(model);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count(): Promise<number> {
    return this.prisma.user.count({ where: { deletedAt: null } });
  }
}
