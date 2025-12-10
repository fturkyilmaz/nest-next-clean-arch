import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './PrismaUserRepository';
import { PrismaService } from '@infrastructure/database/PrismaService';
import { User } from '@domain/entities/User.entity';
import { Email } from '@domain/value-objects/Email.vo';
import { Password } from '@domain/value-objects/Password.vo';

describe('PrismaUserRepository', () => {
    let repository: PrismaUserRepository;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PrismaUserRepository,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                            count: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        repository = module.get<PrismaUserRepository>(PrismaUserRepository);
        prisma = module.get<PrismaService>(PrismaService);
    });

    describe('findByEmail', () => {
        it('should return a User domain object when found', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                password: 'hashedPassword',
                firstName: 'Furkan',
                lastName: 'Türkyılmaz',
                role: 'ADMIN',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await repository.findByEmail('test@example.com');

            expect(result).toBeInstanceOf(User);
            expect(result.getEmail().getValue()).toBe('test@example.com');
            expect(result.getFirstName()).toBe('Furkan');
        });

        it('should return null when user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await repository.findByEmail('notfound@example.com');

            expect(result).toBeNull();
        });
    });

    describe('existsByEmail', () => {
        it('should return true if user exists', async () => {
            (prisma.user.count as jest.Mock).mockResolvedValue(1);

            const result = await repository.existsByEmail('test@example.com');

            expect(result).toBe(true);
        });

        it('should return false if user does not exist', async () => {
            (prisma.user.count as jest.Mock).mockResolvedValue(0);

            const result = await repository.existsByEmail('notfound@example.com');

            expect(result).toBe(false);
        });
    });
});
