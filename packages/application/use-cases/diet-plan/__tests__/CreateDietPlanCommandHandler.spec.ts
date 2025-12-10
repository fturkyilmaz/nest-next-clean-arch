import { Test, TestingModule } from '@nestjs/testing';
import { CreateDietPlanCommandHandler } from '../commands/CreateDietPlanCommandHandler';
import { CreateDietPlanCommand } from '../commands/CreateDietPlanCommand';

describe('CreateDietPlanCommandHandler', () => {
    let handler: CreateDietPlanCommandHandler;
    let mockDietPlanRepository: any;

    beforeEach(async () => {
        mockDietPlanRepository = {
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateDietPlanCommandHandler,
                {
                    provide: 'IDietPlanRepository',
                    useValue: mockDietPlanRepository,
                },
            ],
        }).compile();

        handler = module.get<CreateDietPlanCommandHandler>(CreateDietPlanCommandHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should create diet plan successfully', async () => {
            mockDietPlanRepository.create.mockImplementation((plan) => plan);

            const command = new CreateDietPlanCommand(
                'My Plan',
                'client-123',
                'dietitian-123',
                new Date('2023-01-01'),
                'Description',
                new Date('2023-01-31'),
                { targetCalories: 2000 }
            );

            const result = await handler.execute(command);

            expect(mockDietPlanRepository.create).toHaveBeenCalled();
            expect(result.getName()).toBe('My Plan');
        });
    });
});
