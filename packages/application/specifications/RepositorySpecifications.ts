/**
 * Advanced Repository Specifications
 * Domain-specific specifications with Prisma translation
 */

import { Specification } from '@domain/specifications/Specification';

/**
 * Client Repository Specifications
 */

export class ClientByDietitianSpec extends Specification<any> {
  constructor(private readonly dietitianId: string) {
    super();
  }

  isSatisfiedBy(client: any): boolean {
    return client.dietitianId === this.dietitianId;
  }

  toPrismaWhere() {
    return { dietitianId: this.dietitianId };
  }
}

export class ClientByEmailSpec extends Specification<any> {
  constructor(private readonly email: string) {
    super();
  }

  isSatisfiedBy(client: any): boolean {
    return client.email === this.email;
  }

  toPrismaWhere() {
    return { email: this.email };
  }
}

export class ActiveClientsSpec extends Specification<any> {
  isSatisfiedBy(client: any): boolean {
    return client.isActive === true && client.deletedAt === null;
  }

  toPrismaWhere() {
    return {
      isActive: true,
      deletedAt: null,
    };
  }
}

export class ClientSearchSpec extends Specification<any> {
  constructor(private readonly searchTerm: string) {
    super();
  }

  isSatisfiedBy(client: any): boolean {
    const term = this.searchTerm.toLowerCase();
    return (
      client.firstName?.toLowerCase().includes(term) ||
      client.lastName?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term)
    );
  }

  toPrismaWhere() {
    return {
      OR: [
        { firstName: { contains: this.searchTerm, mode: 'insensitive' } },
        { lastName: { contains: this.searchTerm, mode: 'insensitive' } },
        { email: { contains: this.searchTerm, mode: 'insensitive' } },
      ],
    };
  }
}

export class ClientWithActiveDietPlanSpec extends Specification<any> {
  isSatisfiedBy(client: any): boolean {
    return client.dietPlans?.some((plan: any) => plan.status === 'ACTIVE');
  }

  toPrismaWhere() {
    return {
      dietPlans: {
        some: {
          status: 'ACTIVE',
        },
      },
    };
  }
}

/**
 * Diet Plan Repository Specifications
 */

export class DietPlanByClientSpec extends Specification<any> {
  constructor(private readonly clientId: string) {
    super();
  }

  isSatisfiedBy(plan: any): boolean {
    return plan.clientId === this.clientId;
  }

  toPrismaWhere() {
    return { clientId: this.clientId };
  }
}

export class DietPlanByStatusSpec extends Specification<any> {
  constructor(private readonly status: string) {
    super();
  }

  isSatisfiedBy(plan: any): boolean {
    return plan.status === this.status;
  }

  toPrismaWhere() {
    return { status: this.status };
  }
}

export class ActiveDietPlansSpec extends Specification<any> {
  isSatisfiedBy(plan: any): boolean {
    return plan.status === 'ACTIVE' && plan.deletedAt === null;
  }

  toPrismaWhere() {
    return {
      status: 'ACTIVE',
      deletedAt: null,
    };
  }
}

export class DietPlanInDateRangeSpec extends Specification<any> {
  constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {
    super();
  }

  isSatisfiedBy(plan: any): boolean {
    return plan.startDate >= this.startDate && plan.endDate <= this.endDate;
  }

  toPrismaWhere() {
    return {
      startDate: { gte: this.startDate },
      endDate: { lte: this.endDate },
    };
  }
}

/**
 * Food Item Repository Specifications
 */

export class FoodItemByCategorySpec extends Specification<any> {
  constructor(private readonly category: string) {
    super();
  }

  isSatisfiedBy(item: any): boolean {
    return item.category === this.category;
  }

  toPrismaWhere() {
    return { category: this.category };
  }
}

export class FoodItemSearchSpec extends Specification<any> {
  constructor(private readonly searchTerm: string) {
    super();
  }

  isSatisfiedBy(item: any): boolean {
    const term = this.searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  }

  toPrismaWhere() {
    return {
      OR: [
        { name: { contains: this.searchTerm, mode: 'insensitive' } },
        { description: { contains: this.searchTerm, mode: 'insensitive' } },
      ],
    };
  }
}

export class HighProteinFoodSpec extends Specification<any> {
  constructor(private readonly minProtein: number = 20) {
    super();
  }

  isSatisfiedBy(item: any): boolean {
    return item.protein >= this.minProtein;
  }

  toPrismaWhere() {
    return {
      protein: { gte: this.minProtein },
    };
  }
}

export class LowCalorieFoodSpec extends Specification<any> {
  constructor(private readonly maxCalories: number = 100) {
    super();
  }

  isSatisfiedBy(item: any): boolean {
    return item.calories <= this.maxCalories;
  }

  toPrismaWhere() {
    return {
      calories: { lte: this.maxCalories },
    };
  }
}

/**
 * Complex Specification Examples
 */

// Active clients of a specific dietitian
export const getActiveDietitianClients = (dietitianId: string) =>
  new ActiveClientsSpec().and(new ClientByDietitianSpec(dietitianId));

// Clients with active diet plans
export const getClientsWithActivePlans = () =>
  new ActiveClientsSpec().and(new ClientWithActiveDietPlanSpec());

// High protein, low calorie foods
export const getHealthyProteinFoods = () =>
  new HighProteinFoodSpec(15).and(new LowCalorieFoodSpec(200));

// Active diet plans for a client
export const getActiveClientDietPlans = (clientId: string) =>
  new DietPlanByClientSpec(clientId).and(new ActiveDietPlansSpec());

/**
 * Usage Examples:
 * 
 * // Simple query
 * const activeClients = await clientRepo.find(new ActiveClientsSpec());
 * 
 * // Composite query
 * const myActiveClients = await clientRepo.find(
 *   getActiveDietitianClients(dietitianId)
 * );
 * 
 * // Search with pagination
 * const searchResults = await clientRepo.findPaginated(
 *   new ClientSearchSpec('john'),
 *   1,
 *   20
 * );
 * 
 * // Advanced query
 * const result = await clientRepo.findAdvanced({
 *   specification: new ActiveClientsSpec()
 *     .and(new ClientByDietitianSpec(dietitianId))
 *     .and(new ClientSearchSpec('john')),
 *   pagination: { page: 1, pageSize: 10 },
 *   sorting: [{ field: 'createdAt', order: 'desc' }],
 *   includes: ['metrics', 'dietPlans'],
 * });
 * 
 * // Complex business query
 * const healthyFoods = await foodRepo.find(
 *   new HighProteinFoodSpec(20)
 *     .and(new LowCalorieFoodSpec(150))
 *     .and(new FoodItemByCategorySpec('VEGETABLES'))
 * );
 */
