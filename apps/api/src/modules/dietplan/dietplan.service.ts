// dietplan.service.ts
import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/lib/prisma';
@Injectable()
export class DietPlanService {

  async findByClient(clientId: string) {
    return prisma.dietPlan.findMany({ where: { clientId }, include: { mealPlans: true } });
  }

  async create(dto: { clientId: string; dietitianId: string; meals: any[] }) {
    return prisma.dietPlan.create({
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
