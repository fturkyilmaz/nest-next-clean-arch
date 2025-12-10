import { Test, TestingModule } from '@nestjs/testing';
import { GetClientMetricsHistoryQueryHandler } from '../queries/GetClientMetricsHistoryQueryHandler';
import { GetClientMetricsHistoryQuery } from '../queries/GetClientMetricsHistoryQuery';

describe('GetClientMetricsHistoryQueryHandler', () => {
    let handler: GetClientMetricsHistoryQueryHandler;
    let mockMetricsRepository: any;

    beforeEach(async () => {
        mockMetricsRepository = {
            findByClientId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetClientMetricsHistoryQueryHandler,
                {
                    provide: 'IClientMetricsRepository',
                    useValue: mockMetricsRepository,
                },
            ],
        }).compile();

        handler = module.get<GetClientMetricsHistoryQueryHandler>(
            GetClientMetricsHistoryQueryHandler
        );
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should return metrics history for client', async () => {
            const mockMetrics = [{ id: '1' }, { id: '2' }];
            mockMetricsRepository.findByClientId.mockResolvedValue(mockMetrics);

            const query = new GetClientMetricsHistoryQuery('client-123');
            const result = await handler.execute(query);

            expect(mockMetricsRepository.findByClientId).toHaveBeenCalledWith('client-123', undefined, undefined);
            expect(result).toEqual(mockMetrics);
        });

        it('should pass pagination params', async () => {
            const query = new GetClientMetricsHistoryQuery('client-123', 0, 10);
            await handler.execute(query);

            expect(mockMetricsRepository.findByClientId).toHaveBeenCalledWith('client-123', 0, 10);
        });
    });
});
