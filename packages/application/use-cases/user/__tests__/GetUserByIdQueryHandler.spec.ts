import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByIdQueryHandler } from '../queries/GetUserByIdQueryHandler';
import { GetUserByIdQuery } from '../queries/GetUserByIdQuery';
import { User } from '@domain/entities/User.entity';

describe('GetUserByIdQueryHandler', () => {
    let handler: GetUserByIdQueryHandler;
    let mockUserRepository: any;
    let mockUser: any;

    beforeEach(async () => {
        mockUser = {
            getId: jest.fn().mockReturnValue('user-123'),
            getDeletedAt: jest.fn().mockReturnValue(null),
        };

        mockUserRepository = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetUserByIdQueryHandler,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        handler = module.get<GetUserByIdQueryHandler>(GetUserByIdQueryHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should return user if found and not deleted', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser);

            const query = new GetUserByIdQuery('user-123');
            const result = await handler.execute(query);

            expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
            expect(result).toBe(mockUser);
        });

        it('should return null if user not found', async () => {
            mockUserRepository.findById.mockResolvedValue(null);

            const query = new GetUserByIdQuery('user-999');
            const result = await handler.execute(query);

            expect(result).toBeNull();
        });

        it('should return null if user is soft deleted', async () => {
            mockUser.getDeletedAt.mockReturnValue(new Date());
            mockUserRepository.findById.mockResolvedValue(mockUser);

            const query = new GetUserByIdQuery('user-123');
            const result = await handler.execute(query);

            expect(result).toBeNull();
        });
    });
});
