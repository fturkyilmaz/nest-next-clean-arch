import { faker } from '@faker-js/faker';

/**
 * Test Data Factories
 *
 * Generate realistic test data for unit and integration tests.
 * All factories return complete, valid objects ready for database operations.
 */

export class UserFactory {
  static create(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      password: 'hashed_password_123',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'ADMIN',
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
      ...overrides,
    };
  }

  static createInactive(overrides?: Partial<any>) {
    return UserFactory.create({
      isActive: false,
      ...overrides,
    });
  }

  static createDeleted(overrides?: Partial<any>) {
    return UserFactory.create({
      deletedAt: faker.date.recent(),
      ...overrides,
    });
  }

  static createBatch(count: number) {
    return Array.from({ length: count }, () => UserFactory.create());
  }
}

export class ClientFactory {
  static create(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      dateOfBirth: faker.date.birthdate(),
      gender: 'MALE',
      dietitianId: faker.string.uuid(),
      allergies: null,
      conditions: null,
      medications: null,
      notes: faker.lorem.sentence(),
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
      ...overrides,
    };
  }

  static createBatch(count: number, dietitianId?: string) {
    return Array.from({ length: count }, () =>
      ClientFactory.create({ dietitianId: dietitianId || faker.string.uuid() }),
    );
  }
}

export class DietPlanFactory {
  static create(overrides?: Partial<any>) {
    const startDate = faker.date.future();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    return {
      id: faker.string.uuid(),
      name: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      status: 'ACTIVE',
      startDate,
      endDate,
      userId: faker.string.uuid(),
      clientId: faker.string.uuid(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
      ...overrides,
    };
  }

  static createBatch(count: number) {
    return Array.from({ length: count }, () => DietPlanFactory.create());
  }
}

export class MealFactory {
  static create(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      dietPlanId: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      scheduledTime: faker.date.future(),
      status: 'PENDING',
      calories: faker.number.int({ min: 200, max: 1000 }),
      protein: faker.number.float({ min: 5, max: 50, precision: 0.1 }),
      carbs: faker.number.float({ min: 10, max: 100, precision: 0.1 }),
      fats: faker.number.float({ min: 5, max: 50, precision: 0.1 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
      ...overrides,
    };
  }

  static createBatch(count: number, dietPlanId?: string) {
    return Array.from({ length: count }, () =>
      MealFactory.create({ dietPlanId: dietPlanId || faker.string.uuid() }),
    );
  }
}

export class FoodFactory {
  static create(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      category: faker.helpers.arrayElement([
        'FRUIT',
        'VEGETABLE',
        'PROTEIN',
        'DAIRY',
        'GRAIN',
      ]),
      caloriesPer100g: faker.number.float({ min: 20, max: 900, precision: 0.1 }),
      proteinPer100g: faker.number.float({ min: 0, max: 50, precision: 0.1 }),
      carbsPer100g: faker.number.float({ min: 0, max: 80, precision: 0.1 }),
      fatsPer100g: faker.number.float({ min: 0, max: 40, precision: 0.1 }),
      userId: faker.string.uuid(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
      ...overrides,
    };
  }

  static createBatch(count: number) {
    return Array.from({ length: count }, () => FoodFactory.create());
  }
}

export class MetricFactory {
  static create(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      type: faker.helpers.arrayElement(['WEIGHT', 'BLOOD_PRESSURE', 'BLOOD_SUGAR']),
      value: faker.number.float({ min: 50, max: 200, precision: 0.1 }),
      unit: 'kg',
      recordedAt: faker.date.past(),
      notes: faker.lorem.sentence(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
      ...overrides,
    };
  }

  static createBatch(count: number, userId?: string) {
    return Array.from({ length: count }, () =>
      MetricFactory.create({ userId: userId || faker.string.uuid() }),
    );
  }
}

export class AppointmentFactory {
  static create(overrides?: Partial<any>) {
    const scheduledTime = faker.date.future();
    const duration = faker.number.int({ min: 30, max: 120 });

    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      clientId: faker.string.uuid(),
      title: faker.company.catchPhrase(),
      description: faker.lorem.sentence(),
      scheduledTime,
      duration,
      status: 'SCHEDULED',
      reminderSent: false,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
      ...overrides,
    };
  }

  static createBatch(count: number) {
    return Array.from({ length: count }, () => AppointmentFactory.create());
  }
}

export class NutritionLogFactory {
  static create(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      mealId: faker.string.uuid(),
      foodId: faker.string.uuid(),
      quantity: faker.number.float({ min: 0.1, max: 500, precision: 0.1 }),
      unit: faker.helpers.arrayElement(['g', 'ml', 'oz', 'cup']),
      calories: faker.number.float({ min: 10, max: 500, precision: 0.1 }),
      protein: faker.number.float({ min: 0, max: 50, precision: 0.1 }),
      carbs: faker.number.float({ min: 0, max: 80, precision: 0.1 }),
      fats: faker.number.float({ min: 0, max: 40, precision: 0.1 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
      ...overrides,
    };
  }

  static createBatch(count: number) {
    return Array.from({ length: count }, () => NutritionLogFactory.create());
  }
}

export class AuditLogFactory {
  static create(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      action: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE']),
      entityType: faker.helpers.arrayElement(['User', 'Client', 'DietPlan', 'Meal']),
      entityId: faker.string.uuid(),
      changes: JSON.stringify({ field: 'value' }),
      timestamp: faker.date.recent(),
      createdAt: faker.date.past(),
      deletedAt: null,
      ...overrides,
    };
  }

  static createBatch(count: number) {
    return Array.from({ length: count }, () => AuditLogFactory.create());
  }
}
