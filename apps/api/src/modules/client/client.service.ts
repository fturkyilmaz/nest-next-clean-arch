// client.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ClientService {
  private prisma = new PrismaClient();

  async findAll() {
    return this.prisma.client.findMany();
  }

  async create(dto: { name: string; dietitianId: string }) {
    return this.prisma.client.create({ data: dto });
  }
}
