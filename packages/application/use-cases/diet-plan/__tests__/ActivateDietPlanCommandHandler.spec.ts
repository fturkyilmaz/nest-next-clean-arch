import { Test, TestingModule } from '@nestjs/testing';
import { ActivateDietPlanCommandHandler } from '../commands/ActivateDietPlanCommandHandler';
import { ActivateDietPlanCommand } from '../commands/ActivateDietPlanCommand';

describe('ActivateDietPlanCommandHandler', () => {
    let handler: ActivateDietPlanCommandHandler;
    let mockDietPlanRepository: any;
    let mockDietPlan: any;

    beforeEach(async () => {
        mockDietPlan = {
            getId: jest.fn().mockReturnValue('plan-123'),
            getClientId: jest.fn().mockReturnValue('client-123'),
            activate: jest.fn(),
            complete: jest.fn(),
        };

        mockDietPlanRepository = {
            findById: jest.fn(),
            findActiveByClientId: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActivateDietPlanCommandHandler,
                {
                    provide: 'IDietPlanRepository',
                    useValue: mockDietPlanRepository,
                },
            ],
        }).compile();

        handler = module.get<ActivateDietPlanCommandHandler>(ActivateDietPlanCommandHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should activate diet plan successfully', async () => {
            mockDietPlanRepository.findById.mockResolvedValue(mockDietPlan);
            mockDietPlanRepository.findActiveByClientId.mockResolvedValue(null);
            mockDietPlanRepository.update.mockImplementation((plan) => plan);

            const command = new ActivateDietPlanCommand('plan-123');
            await handler.execute(command);

            expect(mockDietPlan.activate).toHaveBeenCalled();
            expect(mockDietPlanRepository.update).toHaveBeenCalledWith(mockDietPlan);
        });

        it('should deactivate existing active plan before activating new one', async () => {
            mockDietPlanRepository.findById.mockResolvedValue(mockDietPlan);

            const activePlan = {
                getId: () => 'active-plan-456',
                complete: jest.fn(),
            };
            mockDietPlanRepository.findActiveByClientId.mockResolvedValue(activePlan);
            mockDietPlanRepository.update.mockResolvedValue(mockDietPlan);

            const command = new ActivateDietPlanCommand('plan-123');
            await handler.execute(command);

            expect(activePlan.complete).toHaveBeenCalled();
            expect(mockDietPlanRepository.update).toHaveBeenCalledWith(activePlan);
            expect(mockDietPlan.activate).toHaveBeenCalled();
            expect(mockDietPlanRepository.update).toHaveBeenCalledWith(mockDietPlan);
        });

        it('should throw error if diet plan not found', async () => {
            mockDietPlanRepository.findById.mockResolvedValue(null);

            const command = new ActivateDietPlanCommand('plan-123');
            await expect(handler.execute(command)).rejects.toThrow('Diet plan not found');
        });
    });
});
