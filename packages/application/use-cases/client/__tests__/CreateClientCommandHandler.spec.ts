import { Test, TestingModule } from '@nestjs/testing';
import { CreateClientCommandHandler } from '../commands/CreateClientCommandHandler';
import { CreateClientCommand } from '../commands/CreateClientCommand';

describe('CreateClientCommandHandler', () => {
    let handler: CreateClientCommandHandler;
    let mockClientRepository: any;

    beforeEach(async () => {
        mockClientRepository = {
            findByEmail: jest.fn(),
            create: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateClientCommandHandler,
                {
                    provide: 'IClientRepository',
                    useValue: mockClientRepository,
                },
            ],
        }).compile();

        handler = module.get<CreateClientCommandHandler>(CreateClientCommandHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('should create a new client successfully', async () => {
            mockClientRepository.findByEmail.mockResolvedValue(null);
            mockClientRepository.create.mockImplementation((client) => client);

            const command = new CreateClientCommand(
                'John',
                'Doe',
                'client@example.com',
                'dietitian-123',
                '1234567890',
                new Date('1990-01-01'),
                'MALE',
                ['Peanuts'],
                ['Diabetes'],
                ['Insulin'],
                'Notes'
            );

            const result = await handler.execute(command);

            expect(mockClientRepository.findByEmail).toHaveBeenCalledWith('client@example.com');
            expect(mockClientRepository.create).toHaveBeenCalled();
            expect(result.getFirstName()).toBe('John');
            expect(result.getAllergies()).toContain('Peanuts');
        });

        it('should throw error if email already exists', async () => {
            mockClientRepository.findByEmail.mockResolvedValue({ id: 'existing-123' });

            const command = new CreateClientCommand(
                'John',
                'Doe',
                'existing@example.com',
                'dietitian-123',
                '1234567890',
                new Date('1990-01-01'),
                'MALE'
            );

            await expect(handler.execute(command)).rejects.toThrow('Client with this email already exists');
        });
    });
});
