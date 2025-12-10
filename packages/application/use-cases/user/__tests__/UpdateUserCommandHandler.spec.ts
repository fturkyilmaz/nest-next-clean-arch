import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserCommandHandler } from '../commands/UpdateUserCommandHandler';
import { UpdateUserCommand } from '../commands/UpdateUserCommand';
import { User } from '@domain/entities/User.entity';
import { Email } from '@domain/value-objects/Email.vo';

describe('UpdateUserCommandHandler', () => {
    let handler: UpdateUserCommandHandler;
    let mockUserRepository: any;
    let mockUser: any;

    beforeEach(async () => {
        mockUser = {
            getId: jest.fn().mockReturnValue('user-123'),
            getFirstName: jest.fn().mockReturnValue('John'),
            getLastName: jest.fn().mockReturnValue('Doe'),
            updateEmail: jest.fn(),
            updateProfile: jest.fn(),
        };

        mockUserRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateUserCommandHandler,
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        handler = module.get<UpdateUserCommandHandler>(UpdateUserCommandHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should throw error if user not found', async () => {
            mockUserRepository.findById.mockResolvedValue(null);
            const command = new UpdateUserCommand('user-123', 'new@example.com', 'Jane', 'Doe');

            await expect(handler.execute(command)).rejects.toThrow('User not found');
        });

        it('should update user profile successfully', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser);
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.update.mockResolvedValue(mockUser);

            const command = new UpdateUserCommand('user-123', 'new@example.com', 'Jane', 'Smith');
            await handler.execute(command);

            expect(mockUser.updateEmail).toHaveBeenCalled();
            expect(mockUser.updateProfile).toHaveBeenCalledWith('Jane', 'Smith');
            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser);
        });

        it('should throw error if new email is taken by another user', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser);
            const existingUser = {
                getId: () => 'other-user-456'
            };
            mockUserRepository.findByEmail.mockResolvedValue(existingUser);

            const command = new UpdateUserCommand('user-123', 'taken@example.com');
            await expect(handler.execute(command)).rejects.toThrow('Email is already taken by another user');
        });

        it('should allow keeping the same email (if it belongs to the user)', async () => {
            mockUserRepository.findById.mockResolvedValue(mockUser);
            const sameUser = {
                getId: () => 'user-123'
            };
            mockUserRepository.findByEmail.mockResolvedValue(sameUser);
            mockUserRepository.update.mockResolvedValue(mockUser);

            const command = new UpdateUserCommand('user-123', 'current@example.com');
            await handler.execute(command);

            expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser);
        });
    });
});
