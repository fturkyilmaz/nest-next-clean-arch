import { Test, TestingModule } from '@nestjs/testing';
import { GetClientsByDietitianQueryHandler } from '../queries/GetClientsByDietitianQueryHandler';
import { GetClientsByDietitianQuery } from '../queries/GetClientsByDietitianQuery';

describe('GetClientsByDietitianQueryHandler', () => {
    let handler: GetClientsByDietitianQueryHandler;
    let mockClientRepository: any;

    beforeEach(async () => {
        mockClientRepository = {
            findByDietitianId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetClientsByDietitianQueryHandler,
                {
                    provide: 'IClientRepository',
                    useValue: mockClientRepository,
                },
            ],
        }).compile();

        handler = module.get<GetClientsByDietitianQueryHandler>(GetClientsByDietitianQueryHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should return clients for a specific dietitian', async () => {
            const mockClients = [{ id: '1' }, { id: '2' }];
            mockClientRepository.findByDietitianId.mockResolvedValue(mockClients);

            const query = new GetClientsByDietitianQuery('dietitian-123');
            const result = await handler.execute(query);

            expect(mockClientRepository.findByDietitianId).toHaveBeenCalledWith('dietitian-123', {
                isActive: undefined,
                skip: undefined,
                take: undefined,
            });
            expect(result).toEqual(mockClients);
        });

        it('should pass pagination and filter params', async () => {
            const query = new GetClientsByDietitianQuery('dietitian-123', true, 0, 10);
            await handler.execute(query);

            expect(mockClientRepository.findByDietitianId).toHaveBeenCalledWith('dietitian-123', {
                isActive: true,
                skip: 0,
                take: 10,
            });
        });
    });
});
