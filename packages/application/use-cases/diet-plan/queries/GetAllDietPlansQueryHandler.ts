import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllDietPlansQuery } from "./GetAllDietPlansQuery";
import { Inject } from "@nestjs/common";
import { IDietPlanRepository } from "@application/interfaces";
import { DietPlan } from "@domain/entities";
import { PaginatedResponseDto } from "@application/dto/common/PaginatedResponseDto";
import { filter } from "rxjs";

@QueryHandler(GetAllDietPlansQuery)
export class GetAllDietPlansHandler implements IQueryHandler<GetAllDietPlansQuery> {
  constructor(
    @Inject("IDietPlanRepository")
    private readonly dietPlanRepository: IDietPlanRepository
  ) {}

  async execute(
    query: GetAllDietPlansQuery
  ): Promise<PaginatedResponseDto<DietPlan>> {
    const { status = "ACTIVE", isActive = true, page = 1, limit = 10 } = query;

    const [data, total] = await Promise.all([
      this.dietPlanRepository.findAllPaged({
        filters: {
          status,
          isActive,
        },
        page,
        limit,
      }),
      this.dietPlanRepository.count({
        status,
        isActive,
      }),
    ]);

    return new PaginatedResponseDto(data.data, query.page, query.limit, total);
  }
}
