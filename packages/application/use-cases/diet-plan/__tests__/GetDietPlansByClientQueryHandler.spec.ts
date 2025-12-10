import { Test, TestingModule } from '@nestjs/testing';
import { GetDietPlansByClientQueryHandler } from '../queries/GetDietPlansByClientQueryHandler';
import { GetDietPlansByClientQuery } from '../queries/GetDietPlansByClientQuery';

describe('GetDietPlansByClientQueryHandler', () => {
    let handler: GetDietPlansByClientQueryHandler;
    let mockDietPlanRepository: any;

    beforeEach(async () => {
        mockDietPlanRepository = {
            findByClientId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetDietPlansByClientQueryHandler,
                {
                    provide: 'IDietPlanRepository',
                    useValue: mockDietPlanRepository,
                },
            ],
        }).compile();

        handler = module.get<GetDietPlansByClientQueryHandler>(GetDietPlansByClientQueryHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should return diet plans for a client', async () => {
            const mockDietPlans = [{ id: '1' }];
            mockDietPlanRepository.findByClientId.mockResolvedValue(mockDietPlans);

            const query = new GetDietPlansByClientQuery('client-123');
            const result = await handler.execute(query);

            expect(mockDietPlanRepository.findByClientId).toHaveBeenCalledWith('client-123', {
                status: undefined,
                isActive: undefined,
                skip: undefined,
                take: undefined,
            });
            expect(result).toEqual(mockDietPlans);
        });

        it('should pass pagination and filter params', async () => {
            const query = new GetDietPlansByClientQuery('client-123', 'ACTIVE', true, 0, 10);
            await handler.execute(query);

            expect(mockDietPlanRepository.findByClientId).toHaveBeenCalledWith('client-123', {
                status: 'ACTIVE',
                isActive: true,
                skip: 0,
                take: 10,
            });
        });
    });
});
