import { DietPlan, DietPlanStatus, NutritionalGoals } from '../DietPlan.entity';
import { DateRange } from '@domain/value-objects/DateRange.vo';

describe('DietPlan Entity', () => {
    const createValidDateRange = () => {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);
        return DateRange.create(startDate, endDate);
    };

    const createValidNutritionalGoals = (): NutritionalGoals => ({
        targetCalories: 2000,
        targetProtein: 150,
        targetCarbs: 250,
        targetFat: 65,
        targetFiber: 30,
    });

    const createValidDietPlanProps = () => ({
        name: 'Weight Loss Program',
        description: 'A 3-month weight loss plan',
        clientId: 'client-123',
        dietitianId: 'dietitian-456',
        dateRange: createValidDateRange(),
        status: DietPlanStatus.DRAFT,
        nutritionalGoals: createValidNutritionalGoals(),
    });

    describe('create', () => {
        it('should create a diet plan with valid props', () => {
            const props = createValidDietPlanProps();
            const dietPlan = DietPlan.create(props);

            expect(dietPlan.getName()).toBe('Weight Loss Program');
            expect(dietPlan.getClientId()).toBe('client-123');
            expect(dietPlan.getDietitianId()).toBe('dietitian-456');
            expect(dietPlan.getStatus()).toBe(DietPlanStatus.DRAFT);
            expect(dietPlan.getVersion()).toBe(1);
            expect(dietPlan.isActive()).toBe(true);
        });

        it('should default to DRAFT status if not provided', () => {
            const props = createValidDietPlanProps();
            const dietPlan = DietPlan.create(props);
            expect(dietPlan.isDraft()).toBe(true);
        });

        it('should set nutritional goals correctly', () => {
            const dietPlan = DietPlan.create(createValidDietPlanProps());

            expect(dietPlan.getTargetCalories()).toBe(2000);
            expect(dietPlan.getTargetProtein()).toBe(150);
            expect(dietPlan.getTargetCarbs()).toBe(250);
            expect(dietPlan.getTargetFat()).toBe(65);
            expect(dietPlan.getTargetFiber()).toBe(30);
        });
    });

    describe('status transitions', () => {
        let dietPlan: DietPlan;

        beforeEach(() => {
            dietPlan = DietPlan.create(createValidDietPlanProps());
        });

        describe('activate', () => {
            it('should activate a draft diet plan', () => {
                dietPlan.activate();
                expect(dietPlan.getStatus()).toBe(DietPlanStatus.ACTIVE);
                expect(dietPlan.isActiveStatus()).toBe(true);
            });

            it('should throw when activating a cancelled plan', () => {
                dietPlan.cancel();
                expect(() => dietPlan.activate()).toThrow('Cannot activate a cancelled diet plan');
            });

            it('should throw when activating a completed plan', () => {
                dietPlan.activate();
                dietPlan.complete();
                expect(() => dietPlan.activate()).toThrow('Cannot activate a completed diet plan');
            });
        });

        describe('complete', () => {
            it('should complete an active diet plan', () => {
                dietPlan.activate();
                dietPlan.complete();
                expect(dietPlan.getStatus()).toBe(DietPlanStatus.COMPLETED);
                expect(dietPlan.isCompleted()).toBe(true);
            });

            it('should throw when completing a draft plan', () => {
                expect(() => dietPlan.complete()).toThrow('Only active diet plans can be completed');
            });
        });

        describe('cancel', () => {
            it('should cancel a draft diet plan', () => {
                dietPlan.cancel();
                expect(dietPlan.getStatus()).toBe(DietPlanStatus.CANCELLED);
                expect(dietPlan.isCancelled()).toBe(true);
                expect(dietPlan.isActive()).toBe(false);
            });

            it('should cancel an active diet plan', () => {
                dietPlan.activate();
                dietPlan.cancel();
                expect(dietPlan.isCancelled()).toBe(true);
            });

            it('should throw when cancelling a completed plan', () => {
                dietPlan.activate();
                dietPlan.complete();
                expect(() => dietPlan.cancel()).toThrow('Cannot cancel a completed diet plan');
            });
        });
    });

    describe('updating', () => {
        let dietPlan: DietPlan;

        beforeEach(() => {
            dietPlan = DietPlan.create(createValidDietPlanProps());
        });

        describe('updateBasicInfo', () => {
            it('should update name and description', () => {
                dietPlan.updateBasicInfo('New Name', 'New Description');
                expect(dietPlan.getName()).toBe('New Name');
                expect(dietPlan.getDescription()).toBe('New Description');
            });

            it('should throw for empty name', () => {
                expect(() => dietPlan.updateBasicInfo('')).toThrow('Diet plan name is required');
            });
        });

        describe('updateNutritionalGoals', () => {
            it('should update nutritional goals', () => {
                dietPlan.updateNutritionalGoals({
                    targetCalories: 1800,
                    targetProtein: 120,
                });
                expect(dietPlan.getTargetCalories()).toBe(1800);
                expect(dietPlan.getTargetProtein()).toBe(120);
            });

            it('should throw for negative calories', () => {
                expect(() => dietPlan.updateNutritionalGoals({ targetCalories: -100 }))
                    .toThrow('Target calories cannot be negative');
            });

            it('should throw for negative protein', () => {
                expect(() => dietPlan.updateNutritionalGoals({ targetProtein: -50 }))
                    .toThrow('Target protein cannot be negative');
            });
        });
    });

    describe('versioning', () => {
        it('should create a new version as draft', () => {
            const original = DietPlan.create(createValidDietPlanProps());
            original.activate();

            const newVersion = original.createNewVersion();

            expect(newVersion.getName()).toBe(original.getName());
            expect(newVersion.isDraft()).toBe(true);
            expect(newVersion.getVersion()).toBe(1); // New version starts at 1
        });
    });

    describe('soft delete', () => {
        it('should soft delete the diet plan', () => {
            const dietPlan = DietPlan.create(createValidDietPlanProps());
            dietPlan.softDelete();

            expect(dietPlan.getDeletedAt()).toBeDefined();
            expect(dietPlan.isActive()).toBe(false);
        });
    });
});
