import { Test } from '@nestjs/testing';
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
    let controller;
    let commandBus;
    let queryBus;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
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
