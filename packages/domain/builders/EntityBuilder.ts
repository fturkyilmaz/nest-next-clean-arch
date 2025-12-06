import { DietPlan } from '@domain/entities/DietPlan.entity';
import { Client } from '@domain/entities/Client.entity';
import { Result, ValidationError } from '@domain/common/Result';

/**
 * DietPlan Builder
 */
export class DietPlanBuilder {
  private clientId?: string;
  private dietitianId?: string;
  private name?: string;
  private description?: string;
  private startDate?: Date;
  private endDate?: Date;
  private targetCalories?: number;
  private targetProtein?: number;
  private targetCarbs?: number;
  private targetFat?: number;

  forClient(clientId: string): this {
    this.clientId = clientId;
    return this;
  }

  byDietitian(dietitianId: string): this {
    this.dietitianId = dietitianId;
    return this;
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withDateRange(startDate: Date, endDate: Date): this {
    this.startDate = startDate;
    this.endDate = endDate;
    return this;
  }

  withCalorieTarget(calories: number): this {
    this.targetCalories = calories;
    return this;
  }

  withMacroTargets(protein: number, carbs: number, fat: number): this {
    this.targetProtein = protein;
    this.targetCarbs = carbs;
    this.targetFat = fat;
    return this;
  }

  build(): Result<DietPlan, ValidationError> {
    // Validate required fields
    if (!this.clientId) {
      return Result.fail(new ValidationError('Client ID is required'));
    }
    if (!this.dietitianId) {
      return Result.fail(new ValidationError('Dietitian ID is required'));
    }
    if (!this.name) {
      return Result.fail(new ValidationError('Name is required'));
    }
    if (!this.startDate || !this.endDate) {
      return Result.fail(new ValidationError('Date range is required'));
    }
    if (this.endDate <= this.startDate) {
      return Result.fail(new ValidationError('End date must be after start date'));
    }

    const dietPlan = DietPlan.create({
      clientId: this.clientId,
      dietitianId: this.dietitianId,
      name: this.name,
      description: this.description || '',
      status: 'DRAFT' as any,
      dateRange: { startDate: this.startDate, endDate: this.endDate } as any, // Using as any to bypass complex VO creation for now
      nutritionalGoals: {
        calories: this.targetCalories || 2000,
        protein: this.targetProtein || 150,
        carbohydrates: this.targetCarbs || 200,
        fat: this.targetFat || 65,
      } as any,
      isActive: true, // Added required field
    });

    return Result.ok(dietPlan);
  }
}

/**
 * Client Builder
 */
export class ClientBuilder {
  private email?: string;
  private firstName?: string;
  private lastName?: string;
  private phone?: string;
  private dateOfBirth?: Date;
  private gender?: string;
  private dietitianId?: string;
  private allergies: string[] = [];
  private medicalConditions: string[] = [];
  private medications: string[] = [];
  private notes: string = '';

  withEmail(email: string): this {
    this.email = email;
    return this;
  }

  withName(firstName: string, lastName: string): this {
    this.firstName = firstName;
    this.lastName = lastName;
    return this;
  }

  withPhone(phone: string): this {
    this.phone = phone;
    return this;
  }

  withDateOfBirth(date: Date): this {
    this.dateOfBirth = date;
    return this;
  }

  withGender(gender: string): this {
    this.gender = gender;
    return this;
  }

  assignedTo(dietitianId: string): this {
    this.dietitianId = dietitianId;
    return this;
  }

  withAllergies(...allergies: string[]): this {
    this.allergies = allergies;
    return this;
  }

  withMedicalConditions(...conditions: string[]): this {
    this.medicalConditions = conditions;
    return this;
  }

  withMedications(...medications: string[]): this {
    this.medications = medications;
    return this;
  }

  withNotes(notes: string): this {
    this.notes = notes;
    return this;
  }

  build(): Result<Client, ValidationError> {
    if (!this.email) {
      return Result.fail(new ValidationError('Email is required'));
    }
    if (!this.firstName || !this.lastName) {
      return Result.fail(new ValidationError('Name is required'));
    }
    if (!this.dateOfBirth) {
      return Result.fail(new ValidationError('Date of birth is required'));
    }
    if (!this.gender) {
      return Result.fail(new ValidationError('Gender is required'));
    }
    if (!this.dietitianId) {
      return Result.fail(new ValidationError('Dietitian assignment is required'));
    }

    const client = Client.create({
      email: this.email as any,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender as any,
      dietitianId: this.dietitianId,
      allergies: this.allergies,
      conditions: this.medicalConditions,
      medications: this.medications,
      notes: this.notes,
      isActive: true,
    });

    return Result.ok(client);
  }
}

/**
 * Usage:
 * 
 * const dietPlanResult = new DietPlanBuilder()
 *   .forClient(clientId)
 *   .byDietitian(dietitianId)
 *   .withName('Weight Loss Plan')
 *   .withDescription('30-day weight loss program')
 *   .withDateRange(startDate, endDate)
 *   .withCalorieTarget(1800)
 *   .withMacroTargets(140, 180, 60)
 *   .build();
 * 
 * const clientResult = new ClientBuilder()
 *   .withEmail('client@example.com')
 *   .withName('Jane', 'Doe')
 *   .withDateOfBirth(new Date('1990-01-01'))
 *   .withGender('FEMALE')
 *   .assignedTo(dietitianId)
 *   .withAllergies('Peanuts', 'Shellfish')
 *   .withGoal('WEIGHT_LOSS')
 *   .build();
 */
