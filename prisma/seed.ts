// prisma/seed.ts
import { prisma } from './lib/prisma';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import {
  Role,
  Gender,
  DietPlanStatus,
  DayOfWeek,
  TimeOfDay,
  FoodCategory,
  AppointmentStatus,
} from './generated/prisma/enums';

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...');
    await prisma.mealFoodItem.deleteMany();
    await prisma.meal.deleteMany();
    await prisma.mealPlan.deleteMany();
    await prisma.dietPlan.deleteMany();
    await prisma.clientMetrics.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.nutritionalInfo.deleteMany();
    await prisma.foodItem.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();
    await prisma.eventStore.deleteMany();
    await prisma.outboxEvent.deleteMany();
  }

  // Create Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dietapp.com',
      password: await bcrypt.hash('Admin123!@#', 12),
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      isActive: true,
    },
  });

   // Create Admin user
 await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: await bcrypt.hash('Admin123!@#', 12),
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // Create Dietitian users
  const dietitians = await Promise.all(
    Array.from({ length: 5 }).map(async () =>
      prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: await bcrypt.hash('Dietitian123!', 12),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: Role.DIETITIAN,
          isActive: true,
        },
      }),
    ),
  );
  console.log(`✅ Dietitians: ${dietitians.length}`);

  // Create Clients for dietitians
  const clients = await Promise.all(
    Array.from({ length: 20 }).map(async () => {
      const dietitian = faker.helpers.arrayElement(dietitians);
      return prisma.client.create({
        data: {
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          phone: faker.phone.number(),
          dateOfBirth: faker.date.birthdate({ min: 18, max: 75, mode: 'age' }),
          gender: faker.helpers.arrayElement<Gender>([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
          dietitianId: dietitian.id,
          allergies: JSON.stringify(
            faker.helpers.arrayElements(['peanuts', 'gluten', 'shellfish', 'lactose'], { min: 0, max: 2 }),
          ),
          conditions: JSON.stringify(
            faker.helpers.arrayElements(['diabetes', 'hypertension', 'obesity', 'hyperlipidemia'], {
              min: 0,
              max: 2,
            }),
          ),
          medications: JSON.stringify(
            faker.helpers.arrayElements(['metformin', 'statins', 'ace_inhibitor'], { min: 0, max: 2 }),
          ),
          notes: faker.lorem.sentence(),
          isActive: true,
        },
      });
    }),
  );
  console.log(`✅ Clients: ${clients.length}`);

  // Client metrics (initial + recent)
  for (const client of clients) {
    const metricsCount = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < metricsCount; i++) {
      await prisma.clientMetrics.create({
        data: {
          clientId: client.id,
          weight: faker.number.float({ min: 50, max: 120, fractionDigits: 1 }),
        height: faker.number.float({ min: 150, max: 200, fractionDigits: 1 }),
          bmi: faker.number.float({ min: 18, max: 35, fractionDigits: 1 }),
          bodyFat: faker.number.float({ min: 10, max: 35, fractionDigits: 1 }),
          waist: faker.number.float({ min: 70, max: 120, fractionDigits: 1 }),
          hip: faker.number.float({ min: 80, max: 130, fractionDigits: 1 }),
          recordedAt: faker.date.recent({ days: 60 }),
          notes: faker.lorem.sentence(),
        },
      });
    }
  }
  console.log(`✅ Client metrics added`);

  // Diet Plans per client
  const dietPlans = await Promise.all(
    clients.flatMap((client) => {
      const dietitianId = client.dietitianId;
      const planCount = faker.number.int({ min: 1, max: 2 });
      return Array.from({ length: planCount }).map(() =>
        prisma.dietPlan.create({
          data: {
            name: faker.helpers.arrayElement([
              'Weight Loss Program',
              'Diabetic-Friendly Plan',
              'Muscle Gain Plan',
              'Balanced Nutrition',
            ]),
            description: faker.lorem.sentence(),
            clientId: client.id,
            dietitianId,
            startDate: faker.date.recent({ days: 30 }),
            endDate: faker.date.soon({ days: 60 }),
            status: faker.helpers.arrayElement<DietPlanStatus>([
              DietPlanStatus.DRAFT,
              DietPlanStatus.ACTIVE,
              DietPlanStatus.COMPLETED,
            ]),
            targetCalories: faker.number.int({ min: 1600, max: 2600 }),
            targetProtein: faker.number.float({ min: 60, max: 160, fractionDigits: 1 }),
            targetCarbs: faker.number.float({ min: 120, max: 320, fractionDigits: 1 }),
            targetFat: faker.number.float({ min: 40, max: 100, fractionDigits: 1 }),
            targetFiber: faker.number.float({ min: 20, max: 40, fractionDigits: 1 }),
            version: faker.number.int({ min: 1, max: 3 }),
            isActive: true,
          },
        }),
      );
    }),
  );
  console.log(`✅ Diet plans: ${dietPlans.length}`);

  // Food Items + Nutritional Info
  const foodItems = await Promise.all(
    Array.from({ length: 40 }).map(async () => {
      const item = await prisma.foodItem.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          category: faker.helpers.arrayElement<FoodCategory>([
            FoodCategory.PROTEIN,
            FoodCategory.GRAINS,
            FoodCategory.VEGETABLES,
            FoodCategory.FRUITS,
            FoodCategory.DAIRY,
            FoodCategory.SNACKS,
            FoodCategory.BEVERAGES,
            FoodCategory.CONDIMENTS,
          ]),
          servingSize: faker.number.float({ min: 50, max: 250, fractionDigits: 1 }),
          servingUnit: 'grams',
          calories: faker.number.float({ min: 30, max: 600, fractionDigits: 1 }),
          protein: faker.number.float({ min: 0, max: 60, fractionDigits: 1 }),
          carbs: faker.number.float({ min: 0, max: 150, fractionDigits: 1 }),
          fat: faker.number.float({ min: 0, max: 60, fractionDigits: 1 }),
          fiber: faker.number.float({ min: 0, max: 20, fractionDigits: 1 }),
          sugar: faker.number.float({ min: 0, max: 40, fractionDigits: 1 }),
          sodium: faker.number.float({ min: 0, max: 1200, fractionDigits: 1 }),
          isActive: true,
        },
      });

      await prisma.nutritionalInfo.create({
        data: {
          foodItemId: item.id,
          vitaminA: faker.number.float({ min: 0, max: 1000, fractionDigits: 1 }),
          vitaminC: faker.number.float({ min: 0, max: 1000, fractionDigits: 1 }),
          vitaminD: faker.number.float({ min: 0, max: 1000, fractionDigits: 1 }),
          vitaminE: faker.number.float({ min: 0, max: 1000, fractionDigits: 1 }),
          vitaminK: faker.number.float({ min: 0, max: 1000, fractionDigits: 1 }),
          vitaminB6: faker.number.float({ min: 0, max: 1000, fractionDigits: 1 }),
          vitaminB12: faker.number.float({ min: 0, max: 1000, fractionDigits: 1 }),
          folate: faker.number.float({ min: 0, max: 1000, fractionDigits: 1 }),
          calcium: faker.number.float({ min: 0, max: 1500, fractionDigits: 1 }),
          iron: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
          magnesium: faker.number.float({ min: 0, max: 1000, fractionDigits: 1 }),
          phosphorus: faker.number.float({ min: 0, max: 1000, fractionDigits: 1 }),
          potassium: faker.number.float({ min: 0, max: 5000, fractionDigits: 1 }),
          zinc: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
          saturatedFat: faker.number.float({ min: 0, max: 50, fractionDigits: 1 }),
          transFat: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
          monounsaturatedFat: faker.number.float({ min: 0, max: 50, fractionDigits: 1 }),
          polyunsaturatedFat: faker.number.float({ min: 0, max: 50, fractionDigits: 1 }),
          cholesterol: faker.number.float({ min: 0, max: 300, fractionDigits: 1 }),
        },
      });

      return item;
    }),
  );
  console.log(`✅ Food items: ${foodItems.length} (+ nutritional info)`);

  // Appointments per client
  for (const client of clients) {
    const count = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < count; i++) {
      const startTime = faker.date.soon({ days: 30 });
      const endTime = new Date(startTime.getTime() + faker.number.int({ min: 30, max: 90 }) * 60 * 1000);
      await prisma.appointment.create({
        data: {
          clientId: client.id,
          dietitianId: client.dietitianId,
          title: faker.helpers.arrayElement([
            'Initial Consultation',
            'Follow-up Session',
            'Nutrition Review',
            'Progress Check',
          ]),
          description: faker.lorem.sentence(),
          startTime,
          endTime,
          status: faker.helpers.arrayElement<AppointmentStatus>([
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.CANCELLED,
            AppointmentStatus.NO_SHOW,
          ]),
          notes: faker.lorem.sentence(),
        },
      });
    }
  }
  console.log('✅ Appointments created');

  // MealPlans for each DietPlan (7 days)
  for (const dietPlan of dietPlans) {
    const start = dietPlan.startDate;
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + d * 24 * 60 * 60 * 1000);
      const dayOfWeek = [
        DayOfWeek.SUNDAY,
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY,
        DayOfWeek.SATURDAY,
      ][date.getDay()];

      const mealPlan = await prisma.mealPlan.create({
        data: {
          dietPlanId: dietPlan.id,
          dayOfWeek,
          date,
        },
      });

      // Meals for each mealPlan
      const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
      const timeOfDayOptions: TimeOfDay[] = [
        TimeOfDay.BREAKFAST,
        TimeOfDay.LUNCH,
        TimeOfDay.DINNER,
        TimeOfDay.AFTERNOON_SNACK,
        TimeOfDay.MORNING_SNACK,
        TimeOfDay.EVENING_SNACK,
      ];

      const meals = await Promise.all(
        mealNames.map((mn) =>
          prisma.meal.create({
            data: {
              mealPlanId: mealPlan.id,
              name: mn,
              timeOfDay: faker.helpers.arrayElement<TimeOfDay>(timeOfDayOptions),
              description: faker.lorem.sentence(),
              instructions: faker.lorem.sentence(),
              calories: faker.number.float({ min: 200, max: 800, fractionDigits: 1 }),
              protein: faker.number.float({ min: 5, max: 50, fractionDigits: 1 }),
              carbs: faker.number.float({ min: 5, max: 120, fractionDigits: 1 }),
              fat: faker.number.float({ min: 2, max: 40, fractionDigits: 1 }),
              fiber: faker.number.float({ min: 0, max: 15, fractionDigits: 1 }),
            },
          }),
        ),
      );

      // MealFoodItems for each meal
      for (const meal of meals) {
        const selected = faker.helpers.arrayElements(foodItems, { min: 2, max: 5 });
        for (const item of selected) {
          await prisma.mealFoodItem.create({
            data: {
              mealId: meal.id,
              foodItemId: item.id,
              quantity: faker.number.float({ min: 0.5, max: 2.5, fractionDigits: 1 }),
              notes: faker.lorem.words({ min: 0, max: 10 }),
            },
          });
        }
      }
    }
  }
  console.log('✅ Meal plans, meals, and meal-food-items created');

  // Audit logs (optional demo)
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SEED_COMPLETED',
      entity: 'SYSTEM',
      entityId: 'seed',
      changes: 'Initial faker seed generated',
      metadata: JSON.stringify({ clients: clients.length, dietPlans: dietPlans.length, foodItems: foodItems.length }),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
    },
  });
  console.log('✅ Audit log saved');

  console.log('🎉 Seed completed successfully!');
  console.log('📋 Test Accounts:');
  console.log('   Admin: admin@dietapp.com / Admin123!@#');
  console.log('   Dietitian password (all): Dietitian123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
