import { Test, TestingModule } from '@nestjs/testing';
import { GetAllUsersQueryHandler } from '../queries/GetAllUsersQueryHandler';
import { GetAllUsersQuery } from '../queries/GetAllUsersQuery';

describe('GetAllUsersQueryHandler', () => {
    let handler: GetAllUsersQueryHandler;
    let mockUserRepository: any;

    beforeEach(async () => {
        mockUserRepository = {
            findAll: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetAllUsersQueryHandler,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        handler = module.get<GetAllUsersQueryHandler>(GetAllUsersQueryHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should return valid users', async () => {
            const mockUsers = [{ id: '1' }, { id: '2' }];
            mockUserRepository.findAll.mockResolvedValue(mockUsers);

            const query = new GetAllUsersQuery();
            const result = await handler.execute(query);

            expect(mockUserRepository.findAll).toHaveBeenCalledWith({
                role: undefined,
                isActive: undefined,
                skip: undefined,
                take: undefined,
            });
            expect(result).toEqual(mockUsers);
        });

        it('should pass query filters to repository', async () => {
            const query = new GetAllUsersQuery('DIETITIAN', true, 10, 20);
            await handler.execute(query);

            expect(mockUserRepository.findAll).toHaveBeenCalledWith({
                role: 'DIETITIAN',
                isActive: true,
                skip: 10,
                take: 20,
            });
        });
    });
});
