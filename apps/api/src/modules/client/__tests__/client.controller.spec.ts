import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from '../client.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
// Mocks
const mockCommandBus = {
    execute: jest.fn(),
};
const mockQueryBus = {
    execute: jest.fn(),
};

describe('ClientController', () => {
    let controller: ClientController;
    let commandBus: CommandBus;
    let queryBus: QueryBus;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClientController],
            providers: [
                {
                    provide: CommandBus,
                    useValue: mockCommandBus,
                },
                {
                    provide: QueryBus,
                    useValue: mockQueryBus,
                },
            ],
        }).compile();

        controller = module.get<ClientController>(ClientController);
        commandBus = module.get<CommandBus>(CommandBus);
        queryBus = module.get<QueryBus>(QueryBus);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
