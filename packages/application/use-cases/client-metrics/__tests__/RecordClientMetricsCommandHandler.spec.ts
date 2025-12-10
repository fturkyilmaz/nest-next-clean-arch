import { Test, TestingModule } from '@nestjs/testing';
import { RecordClientMetricsCommandHandler } from '../commands/RecordClientMetricsCommandHandler';
import { RecordClientMetricsCommand } from '../commands/RecordClientMetricsCommand';

describe('RecordClientMetricsCommandHandler', () => {
    let handler: RecordClientMetricsCommandHandler;
    let mockMetricsRepository: any;

    beforeEach(async () => {
        mockMetricsRepository = {
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecordClientMetricsCommandHandler,
                {
                    provide: 'IClientMetricsRepository',
                    useValue: mockMetricsRepository,
                },
            ],
        }).compile();

        handler = module.get<RecordClientMetricsCommandHandler>(
            RecordClientMetricsCommandHandler
        );
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should create client metrics successfully', async () => {
            mockMetricsRepository.create.mockImplementation((metrics) => metrics);

            const command = new RecordClientMetricsCommand(
                'client-123',
                75.5,
                180,
                20,
                80,
                90,
                new Date('2023-01-01'),
                'Weekly checkup'
            );

            const result = await handler.execute(command);

            expect(mockMetricsRepository.create).toHaveBeenCalled();
            expect(result.getClientId()).toBe('client-123');
            expect(result.getWeight().getKilograms()).toBe(75.5);
        });
    });
});
