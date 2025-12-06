// dietplan.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DietPlanService {
  private prisma = new PrismaClient();

  async findByClient(clientId: string) {
    return this.prisma.dietPlan.findMany({ where: { clientId }, include: { mealPlans: true } });
  }

  async create(dto: { clientId: string; dietitianId: string; meals: any[] }) {
    return this.prisma.dietPlan.create({
      data: {
        clientId: dto.clientId,
        name: 'Diet Plan', // Added required field
        dietitianId: dto.dietitianId,
        startDate: new Date(), // Added required field
        // meals: { create: dto.meals }, // Commented out complex nested create for now
      },
      include: { mealPlans: true },
    });
  }
}
