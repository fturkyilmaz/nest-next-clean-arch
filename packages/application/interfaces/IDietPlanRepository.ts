import { DietPlanDTO } from "../dto/DietPlanDTO";

export interface IDietPlanRepository {
  create(dto: DietPlanDTO): Promise<DietPlanDTO>;
  findByClient(clientId: string): Promise<DietPlanDTO[]>;
}
