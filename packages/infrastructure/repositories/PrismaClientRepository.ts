import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';
import { Client } from '@domain/entities';
import { ClientRepository } from '@domain/repositories/ClientRepository';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  async findById(id: string): Promise<Client | null> {
    const model = await prisma.client.findUnique({
      where: { id, deletedAt: null },
    });
    return model ? this.toDomain(model) : null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const model = await prisma.client.findUnique({ where: { email } });
    return model ? this.toDomain(model) : null;
  }

  async findByDietitianId(
    dietitianId: string,
    options?: { isActive?: boolean; skip?: number; take?: number },
  ): Promise<Client[]> {
    const { isActive, skip = 0, take = 10 } = options || {};
    const models = await prisma.client.findMany({
      where: {
        dietitianId,
        deletedAt: null,
        ...(isActive === undefined ? {} : { isActive }),
      },
      skip,
      take,
    });
    return models.map((m) => this.toDomain(m));
  }

  async search(
    query: string,
    dietitianId?: string,
    options?: { skip?: number; take?: number },
  ): Promise<Client[]> {
    const { skip = 0, take = 10 } = options || {};
    const models = await prisma.client.findMany({
      where: {
        ...(dietitianId ? { dietitianId } : {}),
        deletedAt: null,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip,
      take,
    });
    return models.map((m) => this.toDomain(m));
  }

  async count(filters?: { dietitianId?: string; isActive?: boolean }): Promise<number> {
    return prisma.client.count({
      where: {
        ...(filters?.dietitianId ? { dietitianId: filters.dietitianId } : {}),
        ...(filters?.isActive !== undefined ? { isActive: filters.isActive } : {}),
        deletedAt: null,
      },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const model = await prisma.client.findUnique({ where: { email } });
    return !!model;
  }

  async delete(id: string): Promise<void> {
    await prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async create(data: any): Promise<Client> {
    const model = await prisma.client.create({ data });
    return this.toDomain(model);
  }

  async findAll(): Promise<Client[]> {
    const models = await prisma.client.findMany({ where: { deletedAt: null } });
    return models.map((m) => this.toDomain(m));
  }

  // 🔄 Mapping helpers
  private toDomain(model: any): Client {
    return Client.reconstitute({
      id: model.id,
      email: model.email,
      firstName: model.firstName,
      lastName: model.lastName,
      phone: model.phone,
      dateOfBirth: model.dateOfBirth,
      gender: model.gender,
      dietitianId: model.dietitianId,
      allergies: model.allergies || [],
      conditions: model.conditions || [],
      medications: model.medications || [],
      notes: model.notes,
      isActive: model.isActive ?? true,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    });
  }
}
