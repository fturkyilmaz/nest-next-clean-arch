import { Test } from '@nestjs/testing';
import { FoodController } from '../food.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateFoodCommand } from '@application/use-cases/food/CreateFoodUseCase';
import { GetAllFoodQuery } from '@application/use-cases/food/GetAllFoodUseCase';
import { GetFoodByIdQuery } from '@application/use-cases/food/GetFoodByIdUseCase';
import { faker } from '@faker-js/faker';
import { FoodCategory } from '@domain/entities/FoodItem.entity';

function generateFakeFood() {
    const dto = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category: faker.helpers.arrayElement(Object.values(FoodCategory)),
        servingSize: faker.number.int({ min: 1, max: 5 }),
        servingUnit: faker.helpers.arrayElement(['piece', 'gram', 'ml']),
        calories: faker.number.int({ min: 10, max: 500 }),
        protein: faker.number.float({ min: 0, max: 50, precision: 0.1 }),
        carbs: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
        fat: faker.number.float({ min: 0, max: 30, precision: 0.1 }),
        fiber: faker.number.float({ min: 0, max: 15, precision: 0.1 }),
        sugar: faker.number.float({ min: 0, max: 40, precision: 0.1 }),
        sodium: faker.number.int({ min: 0, max: 1000 }),
    };
    return dto;
}

describe('FoodController (with Faker)', () => {
    let controller;
    let commandBus;
    let queryBus;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [FoodController],
            providers: [
                { provide: CommandBus, useValue: { execute: jest.fn() } },
                { provide: QueryBus, useValue: { execute: jest.fn() } },
            ],
        }).compile();

        controller = module.get<FoodController>(FoodController);
        commandBus = module.get<CommandBus>(CommandBus);
        queryBus = module.get<QueryBus>(QueryBus);
    });

    it('should create food with faker data', async () => {
        const dto = generateFakeFood();
        (commandBus.execute).mockResolvedValue({ id: faker.string.uuid(), ...dto });

        const result = await controller.create(dto);

        expect(commandBus.execute).toHaveBeenCalledWith(new CreateFoodCommand(dto));
        expect(result.name).toBe(dto.name);
        expect(result.category).toBe(dto.category);
    });

    it('should return all foods', async () => {
        const fakeFoods = Array.from({ length: 3 }, () => ({
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
        }));
        (queryBus.execute).mockResolvedValue(fakeFoods);

        const result = await controller.findAll();

        expect(queryBus.execute).toHaveBeenCalledWith(new GetAllFoodQuery());
        expect(result).toEqual(fakeFoods);
    });

    it('should return food by id', async () => {
        const fakeFood = { id: faker.string.uuid(), name: faker.commerce.productName() };
        (queryBus.execute).mockResolvedValue(fakeFood);

        const result = await controller.findOne(fakeFood.id);

        expect(queryBus.execute).toHaveBeenCalledWith(new GetFoodByIdQuery(fakeFood.id));
        expect(result).toEqual(fakeFood);
    });
});
