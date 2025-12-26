import { DietPlanId } from "@domain/common/Types";
import { DietPlan } from "@domain/entities/DietPlan.entity";
import { PrismaRepositoryBase } from "@infrastructure/repositories/PrismaRepositoryBase";

export interface IDietPlanRepository extends PrismaRepositoryBase<
  DietPlan,
  DietPlan
> {
  /**
   * Find all diet plans for a specific client
   */
  findByClientId(
    clientId: string,
    filters?: {
      status?: string;
      isActive?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<DietPlan[]>;

  /**
   * Find all diet plans created by a specific dietitian
   */
  findByDietitianId(
    dietitianId: string,
    filters?: {
      status?: string;
      isActive?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<DietPlan[]>;

  /**
   * Find active diet plan for a client
   */
  findActiveByClientId(clientId: string): Promise<DietPlan | null>;

  /**
   * Find all diet plans with optional filtering
   */
  findAll(filters?: {
    clientId?: string;
    dietitianId?: string;
    status?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<DietPlan[]>;

  /**
   * Count diet plans with optional filtering
   */
  count(filters?: {
    clientId?: string;
    dietitianId?: string;
    status?: string;
    isActive?: boolean;
  }): Promise<number>;

  /**
   * Find diet plan by ID
   */
  findById(id: DietPlanId): Promise<DietPlan | null>;

  /** * Find all entities with optional filters and pagination */ findAllPaged(
    filters?: Record<string, any>,
    page?: number,
    limit?: number,
    orderBy?: string,
    includes?: string[]
  ): Promise<{
    data: DietPlan[];
    total: number;
    page: number;
    limit: number;
  }>;
}
