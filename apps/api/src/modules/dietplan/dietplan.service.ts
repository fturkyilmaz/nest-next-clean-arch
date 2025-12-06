// dietplan.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DietPlanService {
  private prisma = new PrismaClient();

  async findByClient(clientId: string) {
    return this.prisma.dietPlan.findMany({ where: { clientId }, include: { meals: true } });
  }

  async create(dto: { clientId: string; dietitianId: string; meals: any[] }) {
    return this.prisma.dietPlan.create({
      data: {
        clientId: dto.clientId,
        dietitianId: dto.dietitianId,
        meals: { create: dto.meals },
      },
      include: { meals: true },
    });
  }
}
