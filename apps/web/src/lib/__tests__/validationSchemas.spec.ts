import { z } from 'zod';
import {
  loginSchema,
  registrationSchema,
  createClientSchema,
  createDietPlanSchema,
  updateUserSchema,
  updateClientSchema,
  addClientMetricsSchema,
  type LoginFormInputs,
  type RegistrationFormInputs,
  type CreateClientFormInputs,
  type CreateDietPlanFormInputs,
  type UpdateUserFormInputs,
  type UpdateClientFormInputs,
} from '../validationSchemas';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const data: LoginFormInputs = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(() => loginSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };

      expect(() => loginSchema.parse(data)).toThrow();
    });

    it('should reject password less than 6 characters', () => {
      const data = {
        email: 'test@example.com',
        password: 'pass',
      };

      expect(() => loginSchema.parse(data)).toThrow();
    });

    it('should accept password with exactly 6 characters', () => {
      const data: LoginFormInputs = {
        email: 'test@example.com',
        password: '123456',
      };

      expect(() => loginSchema.parse(data)).not.toThrow();
    });
  });

  describe('registrationSchema', () => {
    it('should validate correct registration data', () => {
      const data: RegistrationFormInputs = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      expect(() => registrationSchema.parse(data)).not.toThrow();
    });

    it('should reject if passwords do not match', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password456',
      };

      expect(() => registrationSchema.parse(data)).toThrow();
    });

    it('should reject missing name', () => {
      const data = {
        name: '',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      expect(() => registrationSchema.parse(data)).toThrow();
    });

    it('should reject invalid email in registration', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
      };

      expect(() => registrationSchema.parse(data)).toThrow();
    });

    it('should reject short password in registration', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'pass',
        confirmPassword: 'pass',
      };

      expect(() => registrationSchema.parse(data)).toThrow();
    });
  });

  describe('createClientSchema', () => {
    const validClientData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      gender: 'FEMALE' as const,
    };

    it('should validate correct client data', () => {
      expect(() => createClientSchema.parse(validClientData)).not.toThrow();
    });

    it('should require first name', () => {
      const data = { ...validClientData, firstName: '' };
      expect(() => createClientSchema.parse(data)).toThrow();
    });

    it('should require last name', () => {
      const data = { ...validClientData, lastName: '' };
      expect(() => createClientSchema.parse(data)).toThrow();
    });

    it('should require valid email', () => {
      const data = { ...validClientData, email: 'invalid' };
      expect(() => createClientSchema.parse(data)).toThrow();
    });

    it('should accept optional phone', () => {
      const data: CreateClientFormInputs = {
        ...validClientData,
        phone: '1234567890',
      };
      expect(() => createClientSchema.parse(data)).not.toThrow();
    });

    it('should accept optional date of birth', () => {
      const data: CreateClientFormInputs = {
        ...validClientData,
        dateOfBirth: '1990-01-01',
      };
      expect(() => createClientSchema.parse(data)).not.toThrow();
    });

    it('should validate gender enum', () => {
      const data = { ...validClientData, gender: 'INVALID' };
      expect(() => createClientSchema.parse(data)).toThrow();
    });

    it('should accept all valid gender values', () => {
      const genders = ['MALE', 'FEMALE', 'OTHER'] as const;

      genders.forEach((gender) => {
        const data = { ...validClientData, gender };
        expect(() => createClientSchema.parse(data)).not.toThrow();
      });
    });

    it('should accept optional allergies', () => {
      const data: CreateClientFormInputs = {
        ...validClientData,
        allergies: 'Peanuts, Dairy',
      };
      expect(() => createClientSchema.parse(data)).not.toThrow();
    });
  });

  describe('createDietPlanSchema', () => {
    const validDietPlanData = {
      clientId: 'client-123',
      name: 'Weight Loss Plan',
      startDate: '2024-01-01',
    };

    it('should validate correct diet plan data', () => {
      expect(() => createDietPlanSchema.parse(validDietPlanData)).not.toThrow();
    });

    it('should require client id', () => {
      const data = { ...validDietPlanData, clientId: '' };
      expect(() => createDietPlanSchema.parse(data)).toThrow();
    });

    it('should require plan name', () => {
      const data = { ...validDietPlanData, name: '' };
      expect(() => createDietPlanSchema.parse(data)).toThrow();
    });

    it('should require start date', () => {
      const data = { ...validDietPlanData, startDate: '' };
      expect(() => createDietPlanSchema.parse(data)).toThrow();
    });

    it('should accept optional end date', () => {
      const data: CreateDietPlanFormInputs = {
        ...validDietPlanData,
        endDate: '2024-12-31',
      };
      expect(() => createDietPlanSchema.parse(data)).not.toThrow();
    });

    it('should validate numeric target values', () => {
      const data: CreateDietPlanFormInputs = {
        ...validDietPlanData,
        targetCalories: '2000',
        targetProtein: '100',
      };
      expect(() => createDietPlanSchema.parse(data)).not.toThrow();
    });

    it('should reject non-numeric target values', () => {
      const data = {
        ...validDietPlanData,
        targetCalories: 'not-a-number',
      };
      expect(() => createDietPlanSchema.parse(data)).toThrow();
    });
  });

  describe('updateUserSchema', () => {
    const validUserData: UpdateUserFormInputs = {
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should validate correct user data', () => {
      expect(() => updateUserSchema.parse(validUserData)).not.toThrow();
    });

    it('should require first name', () => {
      const data = { ...validUserData, firstName: '' };
      expect(() => updateUserSchema.parse(data)).toThrow();
    });

    it('should require last name', () => {
      const data = { ...validUserData, lastName: '' };
      expect(() => updateUserSchema.parse(data)).toThrow();
    });
  });

  describe('updateClientSchema', () => {
    const validClientData: UpdateClientFormInputs = {
      firstName: 'Jane',
      lastName: 'Smith',
    };

    it('should validate correct client update data', () => {
      expect(() => updateClientSchema.parse(validClientData)).not.toThrow();
    });

    it('should accept optional fields', () => {
      const data: UpdateClientFormInputs = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '1234567890',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE',
        allergies: 'Nuts',
        notes: 'Some notes',
      };
      expect(() => updateClientSchema.parse(data)).not.toThrow();
    });

    it('should require first and last name', () => {
      const data = { ...validClientData, firstName: '' };
      expect(() => updateClientSchema.parse(data)).toThrow();
    });
  });

  describe('addClientMetricsSchema', () => {
    const validMetricsData = {
      weight: '75.5',
      height: '180.0',
    };

    it('should validate correct metrics data', () => {
      expect(() => addClientMetricsSchema.parse(validMetricsData)).not.toThrow();
    });

    it('should require weight', () => {
      const data = { ...validMetricsData, weight: '' };
      expect(() => addClientMetricsSchema.parse(data)).toThrow();
    });

    it('should require height', () => {
      const data = { ...validMetricsData, height: '' };
      expect(() => addClientMetricsSchema.parse(data)).toThrow();
    });

    it('should reject non-numeric weight', () => {
      const data = { ...validMetricsData, weight: 'not-a-number' };
      expect(() => addClientMetricsSchema.parse(data)).toThrow();
    });

    it('should reject zero or negative weight', () => {
      const data = { ...validMetricsData, weight: '0' };
      expect(() => addClientMetricsSchema.parse(data)).toThrow();

      const data2 = { ...validMetricsData, weight: '-5' };
      expect(() => addClientMetricsSchema.parse(data2)).toThrow();
    });

    it('should accept optional body metrics', () => {
      const data = {
        ...validMetricsData,
        bodyFat: '20',
        waist: '85',
        hip: '95',
        notes: 'Measurements taken in morning',
      };
      expect(() => addClientMetricsSchema.parse(data)).not.toThrow();
    });

    it('should reject non-numeric optional metrics', () => {
      const data = { ...validMetricsData, bodyFat: 'invalid' };
      expect(() => addClientMetricsSchema.parse(data)).toThrow();
    });
  });

  describe('Type Inference', () => {
    it('should correctly infer LoginFormInputs type', () => {
      const data: LoginFormInputs = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(data).toBeDefined();
    });

    it('should correctly infer RegistrationFormInputs type', () => {
      const data: RegistrationFormInputs = {
        name: 'John',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };
      expect(data).toBeDefined();
    });

    it('should correctly infer CreateClientFormInputs type', () => {
      const data: CreateClientFormInputs = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        gender: 'FEMALE',
      };
      expect(data).toBeDefined();
    });
  });
});
