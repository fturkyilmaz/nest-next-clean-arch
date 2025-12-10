import { Test, TestingModule } from '@nestjs/testing';
import { UpdateClientCommandHandler } from '../commands/UpdateClientCommandHandler';
import { UpdateClientCommand } from '../commands/UpdateClientCommand';

describe('UpdateClientCommandHandler', () => {
    let handler: UpdateClientCommandHandler;
    let mockClientRepository: any;
    let mockClient: any;

    beforeEach(async () => {
        mockClient = {
            updateProfile: jest.fn(),
            updateNotes: jest.fn(),
        };

        mockClientRepository = {
            findById: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateClientCommandHandler,
                {
                    provide: 'IClientRepository',
                    useValue: mockClientRepository,
                },
            ],
        }).compile();

        handler = module.get<UpdateClientCommandHandler>(UpdateClientCommandHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should update client profile successfully', async () => {
            mockClientRepository.findById.mockResolvedValue(mockClient);
            mockClientRepository.update.mockResolvedValue(mockClient);

            const command = new UpdateClientCommand(
                'client-123',
                'Jane',
                'Doe',
                '0987654321',
                new Date('1995-01-01'),
                'FEMALE',
                undefined, // allergies
                undefined, // conditions
                undefined, // medications
                'Updated notes' // notes
            );

            await handler.execute(command);

            expect(mockClientRepository.findById).toHaveBeenCalledWith('client-123');
            expect(mockClient.updateProfile).toHaveBeenCalled();
            expect(mockClient.updateNotes).toHaveBeenCalledWith('Updated notes');
            expect(mockClientRepository.update).toHaveBeenCalledWith(mockClient);
        });

        it('should throw error if client not found', async () => {
            mockClientRepository.findById.mockResolvedValue(null);

            const command = new UpdateClientCommand('client-123');

            await expect(handler.execute(command)).rejects.toThrow('Client not found');
        });
    });
});
