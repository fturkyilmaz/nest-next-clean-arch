import { IDietPlanRepository } from "../interfaces/IDietPlanRepository";
import { DietPlanDTO } from "../dto/DietPlanDTO";

export class CreateDietPlan {
    constructor(private repo: IDietPlanRepository) { }

    async execute(dto: DietPlanDTO) {
        if (!dto.clientId) throw new Error("ClientId is required");
        return await this.repo.create(dto);
    }
}
