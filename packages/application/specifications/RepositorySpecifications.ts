/**
 * Advanced Repository Specifications
 * Domain-specific specifications with Prisma translation
 */

import { Specification } from '@domain/specifications/Specification';
import { Client } from '@domain/entities/Client.entity';
import { DietPlan } from '@domain/entities/DietPlan.entity';
import { FoodItem } from '@domain/entities/FoodItem.entity';

/**
 * Client Repository Specifications
 */

export class ClientByDietitianSpec extends Specification<Client> {
  constructor(private readonly dietitianId: string) {
    super();
  }

  isSatisfiedBy(client: Client): boolean {
    return client.getDietitianId() === this.dietitianId;
  }

  toPrismaWhere() {
    return { dietitianId: this.dietitianId };
  }
}

export class ClientByEmailSpec extends Specification<Client> {
  constructor(private readonly email: string) {
    super();
  }

  isSatisfiedBy(client: Client): boolean {
    return client.getEmail().toString() === this.email;
  }

  toPrismaWhere() {
    return { email: this.email };
  }
}

export class ActiveClientsSpec extends Specification<Client> {
  isSatisfiedBy(client: Client): boolean {
    return client.isActive() && !client.getDeletedAt();
  }

  toPrismaWhere() {
    return {
      isActive: true,
      deletedAt: null,
    };
  }
}

export class ClientSearchSpec extends Specification<Client> {
  constructor(private readonly searchTerm: string) {
    super();
  }

  isSatisfiedBy(client: Client): boolean {
    const term = this.searchTerm.toLowerCase();
    const fullName = client.getFullName().toLowerCase();
    const email = client.getEmail().toString().toLowerCase();

    return fullName.includes(term) || email.includes(term);
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

export class ClientWithActiveDietPlanSpec extends Specification<Client> {
  isSatisfiedBy(client: Client): boolean {
    // This assumes we have loaded checking capability or logic is outside, 
    // but strict typing prevents accessing 'dietPlans' directly if it's not on Client entity public interface.
    // Assuming Client entity doesn't have public getDietPlans() based on previous read.
    // For now, removing runtime check or marking as limitation if Entity doesn't support it yet.
    // But earlier code accessed client.dietPlans.
    // Checking Client.entity.ts again -> it does NOT expose dietPlans relations.
    // So this specification is actually impossible to implement purely on Domain Entity without loading it.
    // We will leave it as 'any' cast internally OR comment out runtime check if impossible.
    // Let's coerce to any for now to maintain behavior until Aggregates are richer.
    return (client as any).dietPlans?.some((plan: any) => plan.status === 'ACTIVE');
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

export class DietPlanByClientSpec extends Specification<DietPlan> {
  constructor(private readonly clientId: string) {
    super();
  }

  isSatisfiedBy(plan: DietPlan): boolean {
    return plan.getClientId() === this.clientId;
  }

  toPrismaWhere() {
    return { clientId: this.clientId };
  }
}

export class DietPlanByStatusSpec extends Specification<DietPlan> {
  constructor(private readonly status: string) {
    super();
  }

  isSatisfiedBy(plan: DietPlan): boolean {
    return plan.getStatus() === this.status;
  }

  toPrismaWhere() {
    return { status: this.status };
  }
}

export class ActiveDietPlansSpec extends Specification<DietPlan> {
  isSatisfiedBy(plan: DietPlan): boolean {
    return plan.isActiveStatus() && !plan.getDeletedAt();
  }

  toPrismaWhere() {
    return {
      status: 'ACTIVE',
      deletedAt: null,
    };
  }
}

export class DietPlanInDateRangeSpec extends Specification<DietPlan> {
  constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {
    super();
  }

  isSatisfiedBy(plan: DietPlan): boolean {
    return plan.getStartDate() >= this.startDate && (plan.getEndDate() ? plan.getEndDate()! <= this.endDate : false);
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

export class FoodItemByCategorySpec extends Specification<FoodItem> {
  constructor(private readonly category: string) {
    super();
  }

  isSatisfiedBy(item: FoodItem): boolean {
    return item.getCategory() === this.category;
  }

  toPrismaWhere() {
    return { category: this.category };
  }
}

export class FoodItemSearchSpec extends Specification<FoodItem> {
  constructor(private readonly searchTerm: string) {
    super();
  }

  isSatisfiedBy(item: FoodItem): boolean {
    const term = this.searchTerm.toLowerCase();
    return (
      item.getName().toLowerCase().includes(term) ||
      (item.getDescription()?.toLowerCase().includes(term) ?? false)
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

export class HighProteinFoodSpec extends Specification<FoodItem> {
  constructor(private readonly minProtein: number = 20) {
    super();
  }

  isSatisfiedBy(item: FoodItem): boolean {
    return item.getNutritionalValue().getProtein() >= this.minProtein;
  }

  toPrismaWhere() {
    return {
      protein: { gte: this.minProtein },
    };
  }
}

export class LowCalorieFoodSpec extends Specification<FoodItem> {
  constructor(private readonly maxCalories: number = 100) {
    super();
  }

  isSatisfiedBy(item: FoodItem): boolean {
    return item.getNutritionalValue().getCalories() <= this.maxCalories;
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
