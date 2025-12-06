import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

/**
 * Integration test setup with Testcontainers
 * Provides isolated PostgreSQL instance for testing
 */
export class TestDatabase {
  private container: StartedTestContainer;
  private prisma: PrismaClient;

  async start(): Promise<void> {
    // Start PostgreSQL container
    this.container = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_USER: 'test',
        POSTGRES_PASSWORD: 'test',
        POSTGRES_DB: 'test_db',
      })
      .withExposedPorts(5432)
      .start();

    const host = this.container.getHost();
    const port = this.container.getMappedPort(5432);
    const databaseUrl = `postgresql://test:test@${host}:${port}/test_db?schema=public`;

    // Initialize Prisma with test database
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    await this.prisma.$connect();

    // Run migrations
    // Note: You'll need to run migrations manually or use Prisma migrate
    // execSync(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);
  }

  async stop(): Promise<void> {
    await this.prisma.$disconnect();
    await this.container.stop();
  }

  getPrisma(): PrismaClient {
    return this.prisma;
  }

  async cleanup(): Promise<void> {
    // Clean all tables
    const tables = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    for (const { tablename } of tables) {
      if (tablename !== '_prisma_migrations') {
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
      }
    }
  }
}

describe('PrismaUserRepository Integration Tests', () => {
  let testDb: TestDatabase;
  let prisma: PrismaClient;

  beforeAll(async () => {
    testDb = new TestDatabase();
    await testDb.start();
    prisma = testDb.getPrisma();
  });

  afterAll(async () => {
    await testDb.stop();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  it('should create and retrieve a user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      role: 'DIETITIAN',
    };

    const created = await prisma.user.create({ data: userData });
    const retrieved = await prisma.user.findUnique({
      where: { id: created.id },
    });

    expect(retrieved).toBeDefined();
    expect(retrieved?.email).toBe(userData.email);
  });

  it('should enforce unique email constraint', async () => {
    const userData = {
      email: 'unique@example.com',
      password: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      role: 'DIETITIAN',
    };

    await prisma.user.create({ data: userData });

    await expect(
      prisma.user.create({ data: userData })
    ).rejects.toThrow();
  });
});
