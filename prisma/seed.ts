import { PrismaClient, Role, Gender, DietPlanStatus, DayOfWeek, TimeOfDay, FoodCategory, AppointmentStatus } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.auditLog.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.nutritionalInfo.deleteMany();
  await prisma.mealFoodItem.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.dietPlan.deleteMany();
  await prisma.clientMetrics.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dietapp.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Created admin user');

  // Create Dietitians
  const dietitian1 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@dietapp.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: Role.DIETITIAN,
      isActive: true,
    },
  });

  const dietitian2 = await prisma.user.create({
    data: {
      email: 'michael.chen@dietapp.com',
      password: hashedPassword,
      firstName: 'Michael',
      lastName: 'Chen',
      role: Role.DIETITIAN,
      isActive: true,
    },
  });
  console.log('✅ Created dietitians');

  // Create Clients
  const client1 = await prisma.client.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0101',
      dateOfBirth: new Date('1985-03-15'),
      gender: Gender.MALE,
      dietitianId: dietitian1.id,
      allergies: JSON.stringify(['peanuts', 'shellfish']),
      conditions: JSON.stringify(['hypertension']),
      medications: JSON.stringify(['lisinopril']),
      notes: 'Prefers low-sodium diet',
      isActive: true,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0102',
      dateOfBirth: new Date('1990-07-22'),
      gender: Gender.FEMALE,
      dietitianId: dietitian1.id,
      allergies: JSON.stringify(['gluten']),
      conditions: JSON.stringify(['celiac disease']),
      notes: 'Strictly gluten-free diet required',
      isActive: true,
    },
  });

  const client3 = await prisma.client.create({
    data: {
      firstName: 'Robert',
      lastName: 'Williams',
      email: 'robert.williams@example.com',
      phone: '+1-555-0103',
      dateOfBirth: new Date('1978-11-30'),
      gender: Gender.MALE,
      dietitianId: dietitian2.id,
      allergies: JSON.stringify([]),
      conditions: JSON.stringify(['type 2 diabetes']),
      medications: JSON.stringify(['metformin']),
      notes: 'Needs carb-controlled diet',
      isActive: true,
    },
  });
  console.log('✅ Created clients');

  // Create Client Metrics
  await prisma.clientMetrics.create({
    data: {
      clientId: client1.id,
      weight: 85.5,
      height: 178,
      bmi: 27.0,
      bodyFat: 22.5,
      waist: 95,
      hip: 102,
      notes: 'Initial assessment',
    },
  });

  await prisma.clientMetrics.create({
    data: {
      clientId: client2.id,
      weight: 62.0,
      height: 165,
      bmi: 22.8,
      bodyFat: 25.0,
      waist: 70,
      hip: 95,
      notes: 'Initial assessment',
    },
  });

  await prisma.clientMetrics.create({
    data: {
      clientId: client3.id,
      weight: 92.0,
      height: 175,
      bmi: 30.0,
      bodyFat: 28.0,
      waist: 102,
      hip: 108,
      notes: 'Initial assessment - needs weight management',
    },
  });
  console.log('✅ Created client metrics');

  // Create Food Items
  const foodItems = await Promise.all([
    // Proteins
    prisma.foodItem.create({
      data: {
        name: 'Chicken Breast (Grilled)',
        description: 'Skinless, boneless chicken breast, grilled',
        category: FoodCategory.PROTEIN,
        servingSize: 100,
        servingUnit: 'grams',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        sugar: 0,
        sodium: 74,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Salmon (Baked)',
        description: 'Atlantic salmon, baked',
        category: FoodCategory.PROTEIN,
        servingSize: 100,
        servingUnit: 'grams',
        calories: 206,
        protein: 22,
        carbs: 0,
        fat: 13,
        fiber: 0,
        sugar: 0,
        sodium: 59,
      },
    }),
    // Vegetables
    prisma.foodItem.create({
      data: {
        name: 'Broccoli (Steamed)',
        description: 'Fresh broccoli, steamed',
        category: FoodCategory.VEGETABLES,
        servingSize: 100,
        servingUnit: 'grams',
        calories: 35,
        protein: 2.4,
        carbs: 7,
        fat: 0.4,
        fiber: 3.3,
        sugar: 1.4,
        sodium: 41,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Spinach (Raw)',
        description: 'Fresh raw spinach',
        category: FoodCategory.VEGETABLES,
        servingSize: 100,
        servingUnit: 'grams',
        calories: 23,
        protein: 2.9,
        carbs: 3.6,
        fat: 0.4,
        fiber: 2.2,
        sugar: 0.4,
        sodium: 79,
      },
    }),
    // Grains
    prisma.foodItem.create({
      data: {
        name: 'Brown Rice (Cooked)',
        description: 'Long grain brown rice, cooked',
        category: FoodCategory.GRAINS,
        servingSize: 100,
        servingUnit: 'grams',
        calories: 112,
        protein: 2.6,
        carbs: 24,
        fat: 0.9,
        fiber: 1.8,
        sugar: 0.4,
        sodium: 5,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Quinoa (Cooked)',
        description: 'Quinoa, cooked',
        category: FoodCategory.GRAINS,
        servingSize: 100,
        servingUnit: 'grams',
        calories: 120,
        protein: 4.4,
        carbs: 21,
        fat: 1.9,
        fiber: 2.8,
        sugar: 0.9,
        sodium: 7,
      },
    }),
    // Fruits
    prisma.foodItem.create({
      data: {
        name: 'Apple',
        description: 'Fresh apple with skin',
        category: FoodCategory.FRUITS,
        servingSize: 100,
        servingUnit: 'grams',
        calories: 52,
        protein: 0.3,
        carbs: 14,
        fat: 0.2,
        fiber: 2.4,
        sugar: 10,
        sodium: 1,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Banana',
        description: 'Fresh banana',
        category: FoodCategory.FRUITS,
        servingSize: 100,
        servingUnit: 'grams',
        calories: 89,
        protein: 1.1,
        carbs: 23,
        fat: 0.3,
        fiber: 2.6,
        sugar: 12,
        sodium: 1,
      },
    }),
    // Dairy
    prisma.foodItem.create({
      data: {
        name: 'Greek Yogurt (Plain, Non-fat)',
        description: 'Plain non-fat Greek yogurt',
        category: FoodCategory.DAIRY,
        servingSize: 100,
        servingUnit: 'grams',
        calories: 59,
        protein: 10,
        carbs: 3.6,
        fat: 0.4,
        fiber: 0,
        sugar: 3.2,
        sodium: 36,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Almonds',
        description: 'Raw almonds',
        category: FoodCategory.FATS_OILS,
        servingSize: 28,
        servingUnit: 'grams',
        calories: 164,
        protein: 6,
        carbs: 6,
        fat: 14,
        fiber: 3.5,
        sugar: 1.2,
        sodium: 0,
      },
    }),
  ]);
  console.log('✅ Created food items');

  // Create Diet Plan
  const dietPlan1 = await prisma.dietPlan.create({
    data: {
      name: 'Weight Management Plan',
      description: 'Balanced diet plan for healthy weight loss',
      clientId: client1.id,
      dietitianId: dietitian1.id,
      startDate: new Date(),
      status: DietPlanStatus.ACTIVE,
      targetCalories: 2000,
      targetProtein: 150,
      targetCarbs: 200,
      targetFat: 65,
      targetFiber: 30,
      version: 1,
      isActive: true,
    },
  });

  const dietPlan2 = await prisma.dietPlan.create({
    data: {
      name: 'Gluten-Free Plan',
      description: 'Strictly gluten-free meal plan',
      clientId: client2.id,
      dietitianId: dietitian1.id,
      startDate: new Date(),
      status: DietPlanStatus.ACTIVE,
      targetCalories: 1800,
      targetProtein: 120,
      targetCarbs: 180,
      targetFat: 60,
      targetFiber: 25,
      version: 1,
      isActive: true,
    },
  });
  console.log('✅ Created diet plans');

  // Create Meal Plans for Diet Plan 1 (Monday)
  const mealPlan1 = await prisma.mealPlan.create({
    data: {
      dietPlanId: dietPlan1.id,
      dayOfWeek: DayOfWeek.MONDAY,
    },
  });

  // Create Meals for Monday
  const breakfast = await prisma.meal.create({
    data: {
      mealPlanId: mealPlan1.id,
      name: 'Healthy Breakfast',
      timeOfDay: TimeOfDay.BREAKFAST,
      description: 'Protein-rich breakfast with fruits',
      instructions: 'Mix yogurt with banana slices and almonds',
      calories: 312,
      protein: 17.1,
      carbs: 32.6,
      fat: 14.7,
      fiber: 6.1,
    },
  });

  const lunch = await prisma.meal.create({
    data: {
      mealPlanId: mealPlan1.id,
      name: 'Grilled Chicken Lunch',
      timeOfDay: TimeOfDay.LUNCH,
      description: 'Lean protein with vegetables and grains',
      instructions: 'Serve grilled chicken with steamed broccoli and brown rice',
      calories: 312,
      protein: 36,
      carbs: 31,
      fat: 4.9,
      fiber: 5.1,
    },
  });

  const dinner = await prisma.meal.create({
    data: {
      mealPlanId: mealPlan1.id,
      name: 'Salmon Dinner',
      timeOfDay: TimeOfDay.DINNER,
      description: 'Omega-3 rich dinner',
      instructions: 'Bake salmon and serve with quinoa and spinach',
      calories: 349,
      protein: 29.3,
      carbs: 24.6,
      fat: 15.3,
      fiber: 5,
    },
  });
  console.log('✅ Created meals');

  // Link food items to meals
  await prisma.mealFoodItem.createMany({
    data: [
      // Breakfast
      { mealId: breakfast.id, foodItemId: foodItems[8].id, quantity: 1.5 }, // Greek Yogurt
      { mealId: breakfast.id, foodItemId: foodItems[7].id, quantity: 1 }, // Banana
      { mealId: breakfast.id, foodItemId: foodItems[9].id, quantity: 1 }, // Almonds
      // Lunch
      { mealId: lunch.id, foodItemId: foodItems[0].id, quantity: 1 }, // Chicken
      { mealId: lunch.id, foodItemId: foodItems[2].id, quantity: 1 }, // Broccoli
      { mealId: lunch.id, foodItemId: foodItems[4].id, quantity: 1 }, // Brown Rice
      // Dinner
      { mealId: dinner.id, foodItemId: foodItems[1].id, quantity: 1 }, // Salmon
      { mealId: dinner.id, foodItemId: foodItems[5].id, quantity: 1 }, // Quinoa
      { mealId: dinner.id, foodItemId: foodItems[3].id, quantity: 1 }, // Spinach
    ],
  });
  console.log('✅ Linked food items to meals');

  // Create Appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      clientId: client1.id,
      dietitianId: dietitian1.id,
      title: 'Initial Consultation',
      description: 'First meeting to discuss goals and create diet plan',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
      status: AppointmentStatus.SCHEDULED,
    },
  });

  await prisma.appointment.create({
    data: {
      clientId: client2.id,
      dietitianId: dietitian1.id,
      title: 'Follow-up Session',
      description: 'Review progress and adjust meal plan',
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 45 * 60 * 1000), // 45 minutes later
      status: AppointmentStatus.CONFIRMED,
    },
  });
  console.log('✅ Created appointments');

  // Create Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: dietitian1.id,
      action: 'CREATE',
      entity: 'DietPlan',
      entityId: dietPlan1.id,
      changes: JSON.stringify({ name: 'Weight Management Plan', status: 'ACTIVE' }),
      metadata: JSON.stringify({ clientName: 'John Doe' }),
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: dietitian1.id,
      action: 'CREATE',
      entity: 'Client',
      entityId: client1.id,
      changes: JSON.stringify({ firstName: 'John', lastName: 'Doe' }),
      metadata: JSON.stringify({ action: 'Initial client registration' }),
      ipAddress: '127.0.0.1',
      userAgent: 'Seed Script',
    },
  });
  console.log('✅ Created audit logs');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Clients: ${await prisma.client.count()}`);
  console.log(`   - Diet Plans: ${await prisma.dietPlan.count()}`);
  console.log(`   - Meals: ${await prisma.meal.count()}`);
  console.log(`   - Food Items: ${await prisma.foodItem.count()}`);
  console.log(`   - Appointments: ${await prisma.appointment.count()}`);
  console.log('\n🔐 Login Credentials:');
  console.log('   Admin: admin@dietapp.com / Password123!');
  console.log('   Dietitian 1: sarah.johnson@dietapp.com / Password123!');
  console.log('   Dietitian 2: michael.chen@dietapp.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
