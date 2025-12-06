import { PrismaClient } from "@prisma/client";
import { IDietPlanRepository } from "@diet/application/interfaces/IDietPlanRepository";
import { DietPlanDTO } from "@diet/application/dto/DietPlanDTO";

export class DietPlanRepositoryPrisma implements IDietPlanRepository {
  private prisma = new PrismaClient();

  async create(dto: DietPlanDTO): Promise<DietPlanDTO> {
    return this.prisma.dietPlan.create({ data: dto });
  }

  async findByClient(clientId: string): Promise<DietPlanDTO[]> {
    return this.prisma.dietPlan.findMany({ where: { clientId } });
  }
}
