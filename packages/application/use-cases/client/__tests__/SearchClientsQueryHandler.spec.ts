import { Test, TestingModule } from '@nestjs/testing';
import { SearchClientsQueryHandler } from '../queries/SearchClientsQueryHandler';
import { SearchClientsQuery } from '../queries/SearchClientsQuery';

describe('SearchClientsQueryHandler', () => {
    let handler: SearchClientsQueryHandler;
    let mockClientRepository: any;

    beforeEach(async () => {
        mockClientRepository = {
            search: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchClientsQueryHandler,
                {
                    provide: 'IClientRepository',
                    useValue: mockClientRepository,
                },
            ],
        }).compile();

        handler = module.get<SearchClientsQueryHandler>(SearchClientsQueryHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should search clients with given term', async () => {
            const mockClients = [{ id: '1' }, { id: '2' }];
            mockClientRepository.search.mockResolvedValue(mockClients);

            const query = new SearchClientsQuery('term', 'dietitian-123');
            const result = await handler.execute(query);

            expect(mockClientRepository.search).toHaveBeenCalledWith('term', 'dietitian-123', {
                skip: undefined,
                take: undefined,
            });
            expect(result).toEqual(mockClients);
        });

        it('should pass pagination params', async () => {
            const query = new SearchClientsQuery('term', 'dietitian-123', 0, 10);
            await handler.execute(query);

            expect(mockClientRepository.search).toHaveBeenCalledWith('term', 'dietitian-123', {
                skip: 0,
                take: 10,
            });
        });
    });
});
