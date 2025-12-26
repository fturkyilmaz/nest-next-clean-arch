import { PrismaOrderRepository } from '@infrastructure/repositories/PrismaOrderRepository';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@infrastructure/database/PrismaService';

describe('PrismaOrderRepository', () => {
  let repository: PrismaOrderRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaOrderRepository,
        {
          provide: PrismaService,
          useValue: {
            // Mock Prisma model methods
            user: { findUnique: jest.fn(), count: jest.fn() },
            product: { findUnique: jest.fn(), findMany: jest.fn() },
            cart: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
            order: { findUnique: jest.fn(), create: jest.fn() },
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaOrderRepository>(PrismaOrderRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // örnek testler
  it('findById should return entity when found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
    const result = await repository.findById('1');
    expect(result).not.toBeNull();
  });

  it('findById should return null when not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await repository.findById('999');
    expect(result).toBeNull();
  });
});
