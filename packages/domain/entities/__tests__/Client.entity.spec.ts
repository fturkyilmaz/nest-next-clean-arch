import { Client, Gender } from '../Client.entity';
import { Email } from '@domain/value-objects/Email.vo';

describe('Client Entity', () => {
    const createValidEmail = () => {
        const result = Email.create('test@example.com');
        if (!result.isSuccess()) throw new Error('Failed to create email');
        return result.getValue();
    };

    const createValidClientProps = () => ({
        firstName: 'John',
        lastName: 'Doe',
        email: createValidEmail(),
        dietitianId: 'dietitian-123',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-15'),
        gender: Gender.MALE,
    });

    describe('create', () => {
        it('should create a client with valid props', () => {
            const props = createValidClientProps();
            const client = Client.create(props);

            expect(client.getFirstName()).toBe('John');
            expect(client.getLastName()).toBe('Doe');
            expect(client.getFullName()).toBe('John Doe');
            expect(client.getEmail().getValue()).toBe('test@example.com');
            expect(client.getDietitianId()).toBe('dietitian-123');
            expect(client.isActive()).toBe(true);
        });

        it('should initialize with empty arrays for allergies, conditions, medications', () => {
            const props = createValidClientProps();
            const client = Client.create(props);

            expect(client.getAllergies()).toEqual([]);
            expect(client.getConditions()).toEqual([]);
            expect(client.getMedications()).toEqual([]);
        });

        it('should set createdAt and updatedAt to current time', () => {
            const before = new Date();
            const client = Client.create(createValidClientProps());
            const after = new Date();

            expect(client.getCreatedAt().getTime()).toBeGreaterThanOrEqual(before.getTime());
            expect(client.getCreatedAt().getTime()).toBeLessThanOrEqual(after.getTime());
        });
    });

    describe('reconstitute', () => {
        it('should reconstitute a client from existing props', () => {
            const props = {
                id: 'client-123',
                firstName: 'Jane',
                lastName: 'Smith',
                email: createValidEmail(),
                dietitianId: 'dietitian-456',
                allergies: ['peanuts'],
                conditions: ['diabetes'],
                medications: ['metformin'],
                isActive: true,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-06-01'),
            };

            const client = Client.reconstitute(props);

            expect(client.getId()).toBe('client-123');
            expect(client.getAllergies()).toContain('peanuts');
        });
    });

    describe('business logic', () => {
        let client: Client;

        beforeEach(() => {
            client = Client.create(createValidClientProps());
        });

        describe('getAge', () => {
            it('should calculate age correctly', () => {
                const age = client.getAge();
                expect(age).toBeGreaterThan(30); // Born in 1990
            });

            it('should return undefined if no dateOfBirth', () => {
                const props = { ...createValidClientProps(), dateOfBirth: undefined };
                const clientWithoutDob = Client.create(props);
                expect(clientWithoutDob.getAge()).toBeUndefined();
            });
        });

        describe('allergies management', () => {
            it('should add allergy', () => {
                client.addAllergy('gluten');
                expect(client.getAllergies()).toContain('gluten');
            });

            it('should not add duplicate allergy', () => {
                client.addAllergy('gluten');
                client.addAllergy('gluten');
                expect(client.getAllergies().filter(a => a === 'gluten')).toHaveLength(1);
            });

            it('should throw error for empty allergy', () => {
                expect(() => client.addAllergy('')).toThrow('Allergy cannot be empty');
            });

            it('should remove allergy', () => {
                client.addAllergy('gluten');
                client.removeAllergy('gluten');
                expect(client.getAllergies()).not.toContain('gluten');
            });
        });

        describe('conditions management', () => {
            it('should add condition', () => {
                client.addCondition('hypertension');
                expect(client.getConditions()).toContain('hypertension');
            });

            it('should throw error for empty condition', () => {
                expect(() => client.addCondition('')).toThrow('Condition cannot be empty');
            });
        });

        describe('medications management', () => {
            it('should add medication', () => {
                client.addMedication('aspirin');
                expect(client.getMedications()).toContain('aspirin');
            });

            it('should throw error for empty medication', () => {
                expect(() => client.addMedication('')).toThrow('Medication cannot be empty');
            });
        });

        describe('dietitian assignment', () => {
            it('should assign to new dietitian', () => {
                client.assignToDietitian('dietitian-789');
                expect(client.getDietitianId()).toBe('dietitian-789');
            });

            it('should throw error for empty dietitian ID', () => {
                expect(() => client.assignToDietitian('')).toThrow('Dietitian ID is required');
            });
        });

        describe('activation', () => {
            it('should deactivate client', () => {
                client.deactivate();
                expect(client.isActive()).toBe(false);
            });

            it('should activate client', () => {
                client.deactivate();
                client.activate();
                expect(client.isActive()).toBe(true);
            });

            it('should soft delete client', () => {
                client.softDelete();
                expect(client.getDeletedAt()).toBeDefined();
                expect(client.isActive()).toBe(false);
            });
        });
    });
});
