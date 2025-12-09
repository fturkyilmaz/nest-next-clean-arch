import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...');
    await prisma.mealFoodItem.deleteMany();
    await prisma.meal.deleteMany();
    await prisma.mealPlan.deleteMany();
    await prisma.dietPlan.deleteMany();
    await prisma.clientMetrics.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.client.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create Admin user
  const hashedPassword = await bcrypt.hash('Admin123!@#', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dietapp.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // Create Dietitian users
  const dietitians = await Promise.all([
    prisma.user.create({
      data: {
        email: 'dr.smith@dietapp.com',
        password: await bcrypt.hash('Dietitian123!', 12),
        firstName: 'John',
        lastName: 'Smith',
        role: Role.DIETITIAN,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'dr.jones@dietapp.com',
        password: await bcrypt.hash('Dietitian123!', 12),
        firstName: 'Sarah',
        lastName: 'Jones',
        role: Role.DIETITIAN,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${dietitians.length} dietitians`);

  // Create Clients for each dietitian
  const clients = await Promise.all([
    // Clients for Dr. Smith
    prisma.client.create({
      data: {
        email: 'john.doe@email.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'MALE',
        dietitianId: dietitians[0].id,
        allergies: JSON.stringify(['peanuts', 'shellfish']),
        conditions: JSON.stringify(['type2_diabetes']),
        isActive: true,
      },
    }),
    prisma.client.create({
      data: {
        email: 'jane.smith@email.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567891',
        dateOfBirth: new Date('1985-08-22'),
        gender: 'FEMALE',
        dietitianId: dietitians[0].id,
        conditions: JSON.stringify(['hypertension']),
        isActive: true,
      },
    }),
    // Clients for Dr. Jones
    prisma.client.create({
      data: {
        email: 'mike.wilson@email.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        phone: '+1234567892',
        dateOfBirth: new Date('1978-12-03'),
        gender: 'MALE',
        dietitianId: dietitians[1].id,
        allergies: JSON.stringify(['gluten']),
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${clients.length} clients`);

  // Create Client Metrics
  for (const client of clients) {
    await prisma.clientMetrics.create({
      data: {
        clientId: client.id,
        weight: 75 + Math.random() * 20,
        height: 165 + Math.random() * 20,
        bmi: 22 + Math.random() * 5,
        bodyFat: 18 + Math.random() * 10,
        recordedAt: new Date(),
      },
    });
  }
  console.log(`✅ Created initial metrics for clients`);

  // Create Diet Plans
  const dietPlans = await Promise.all([
    prisma.dietPlan.create({
      data: {
        name: 'Weight Loss Program',
        description: '12-week weight loss program with balanced nutrition',
        clientId: clients[0].id,
        dietitianId: dietitians[0].id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        targetCalories: 1800,
        targetProtein: 120,
        targetCarbs: 200,
        targetFat: 60,
        targetFiber: 30,
        isActive: true,
      },
    }),
    prisma.dietPlan.create({
      data: {
        name: 'Diabetic-Friendly Plan',
        description: 'Low glycemic index meal plan for diabetes management',
        clientId: clients[0].id,
        dietitianId: dietitians[0].id,
        startDate: new Date(),
        status: 'DRAFT',
        targetCalories: 2000,
        targetProtein: 100,
        targetCarbs: 180,
        targetFat: 70,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${dietPlans.length} diet plans`);

  // Create Food Items
  const foodItems = await Promise.all([
    prisma.foodItem.create({
      data: {
        name: 'Grilled Chicken Breast',
        description: 'Lean protein source',
        category: 'PROTEIN',
        servingSize: 100,
        servingUnit: 'grams',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        isActive: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Brown Rice',
        description: 'Whole grain carbohydrate',
        category: 'GRAINS',
        servingSize: 150,
        servingUnit: 'grams',
        calories: 166,
        protein: 3.5,
        carbs: 35,
        fat: 1.3,
        fiber: 2,
        isActive: true,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: 'Steamed Broccoli',
        description: 'Nutrient-rich vegetable',
        category: 'VEGETABLES',
        servingSize: 100,
        servingUnit: 'grams',
        calories: 35,
        protein: 2.4,
        carbs: 7,
        fat: 0.4,
        fiber: 2.6,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${foodItems.length} food items`);

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   Admin: admin@dietapp.com / Admin123!@#');
  console.log('   Dietitian: dr.smith@dietapp.com / Dietitian123!');
  console.log('   Dietitian: dr.jones@dietapp.com / Dietitian123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
