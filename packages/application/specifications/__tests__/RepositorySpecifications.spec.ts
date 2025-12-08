import {
    ActiveClientsSpec,
    ClientSearchSpec,
    DietPlanByStatusSpec,
    HighProteinFoodSpec,
} from '@application/specifications/RepositorySpecifications';
import { Client, Gender } from '@domain/entities/Client.entity';
import { DietPlan, DietPlanStatus } from '@domain/entities/DietPlan.entity';
import { FoodCategory, FoodItem } from '@domain/entities/FoodItem.entity';
import { Email } from '@domain/value-objects/Email.vo';
import { NutritionalValue } from '@domain/value-objects/NutritionalValue.vo';
import { DateRange } from '@domain/value-objects/DateRange.vo';
// Assuming NutritionalGoals interface is exported or I mock it
import { NutritionalGoals } from '@domain/entities/DietPlan.entity';

describe('Repository Specifications', () => {
    describe('ActiveClientsSpec', () => {
        it('should be satisfied by active client with no deletion date', () => {
            const client = Client.create({
                firstName: 'John',
                lastName: 'Doe',
                email: Email.create('john@example.com').getValue(),
                dietitianId: 'd1',
                isActive: true,
            });

            const spec = new ActiveClientsSpec();
            expect(spec.isSatisfiedBy(client)).toBe(true);
        });

        it('should not be satisfied by inactive client', () => {
            const client = Client.create({
                firstName: 'John',
                lastName: 'Doe',
                email: Email.create('john@example.com').getValue(),
                dietitianId: 'd1',
                isActive: false,
            });

            const spec = new ActiveClientsSpec();
            expect(spec.isSatisfiedBy(client)).toBe(false);
        });
    });

    describe('ClientSearchSpec', () => {
        it('should satisfy when name matches', () => {
            const client = Client.create({
                firstName: 'John',
                lastName: 'Doe',
                email: Email.create('john@example.com').getValue(),
                dietitianId: 'd1',
            });

            const spec = new ClientSearchSpec('John');
            expect(spec.isSatisfiedBy(client)).toBe(true);
        });
    });

    describe('HighProteinFoodSpec', () => {
        it('should satisfy significantly high protein', () => {
            // Mocking nutritional value for simplicity if complex
            const nv = NutritionalValue.create({
                calories: 100,
                protein: 25,
                carbs: 10,
                fat: 5,
                fiber: 2
            });

            const food = FoodItem.create({
                name: "Chicken Breast",
                category: FoodCategory.PROTEIN,
                servingSize: 100,
                servingUnit: 'g',
                nutritionalValue: nv,
                isActive: true
            });

            const spec = new HighProteinFoodSpec(20);
            expect(spec.isSatisfiedBy(food)).toBe(true);
        });
    });
});
