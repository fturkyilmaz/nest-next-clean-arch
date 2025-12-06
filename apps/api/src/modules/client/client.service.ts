// örnek: apps/api/src/modules/client/client.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ClientService {
  private prisma = new PrismaClient();

  async findAll() {
    return this.prisma.client.findMany({ include: { dietPlans: true } });
  }

  async create(dto: { name: string; dietitianId: string }) {
    return this.prisma.client.create({
      data: {
        firstName: dto.name.split(' ')[0] || 'Unknown',
        lastName: dto.name.split(' ').slice(1).join(' ') || 'User',
        email: `temp_${Date.now()}@example.com`, // Dummy email to satisfy unique constraint
        dietitianId: dto.dietitianId,
      }
    });
  }
}
