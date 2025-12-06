import { DietPlan } from '@domain/entities/DietPlan.entity';

export interface IDietPlanRepository {
  /**
   * Find diet plan by ID
   */
  findById(id: string): Promise<DietPlan | null>;

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
   * Create a new diet plan
   */
  create(dietPlan: DietPlan): Promise<DietPlan>;

  /**
   * Update an existing diet plan
   */
  update(dietPlan: DietPlan): Promise<DietPlan>;

  /**
   * Delete a diet plan (soft delete)
   */
  delete(id: string): Promise<void>;
}
