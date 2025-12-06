import { User } from '@domain/entities/User.entity';
import { Client } from '@domain/entities/Client.entity';
import { DietPlan } from '@domain/entities/DietPlan.entity';
import { Email } from '@domain/value-objects/Email.vo';
import { Password } from '@domain/value-objects/Password.vo';
import { Result, ValidationError } from '@domain/common/Result';

/**
 * Abstract Factory Interface
 */
export interface IEntityFactory<T> {
  create(data: any): Result<T, ValidationError>;
}

/**
 * User Factory
 */
export class UserFactory implements IEntityFactory<User> {
  create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }): Result<User, ValidationError> {
    // Validate email
    const emailResult = Email.create(data.email);
    if (emailResult.isFailure()) {
      return Result.fail(emailResult.getError());
    }

    // Validate password
    const passwordResult = Password.create(data.password);
    if (passwordResult.isFailure()) {
      return Result.fail(passwordResult.getError());
    }

    // Create user
    const user = User.create({
      email: emailResult.getValue(),
      password: passwordResult.getValue() as any,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role as any,
      isActive: true,
    });

    return Result.ok(user);
  }

  createDietitian(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Result<User, ValidationError> {
    return this.create({ ...data, role: 'DIETITIAN' });
  }

  createAdmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Result<User, ValidationError> {
    return this.create({ ...data, role: 'ADMIN' });
  }
}

/**
 * Client Factory
 */
export class ClientFactory implements IEntityFactory<Client> {
  create(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth: Date;
    gender: string;
    dietitianId: string;
  }): Result<Client, ValidationError> {
    // Validate age
    const age = this.calculateAge(data.dateOfBirth);
    if (age < 18) {
      return Result.fail(
        new ValidationError('Client must be at least 18 years old')
      );
    }

    const client = Client.create({
      email: data.email as any,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender as any,
      dietitianId: data.dietitianId,
      allergies: [],
      conditions: [],
      medications: [],
      notes: '',
    });

    return Result.ok(client);
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }
}

/**
 * DietPlan Factory
 */
export class DietPlanFactory implements IEntityFactory<DietPlan> {
  create(data: {
    clientId: string;
    dietitianId: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
  }): Result<DietPlan, ValidationError> {
    // Validate dates
    if (data.endDate <= data.startDate) {
      return Result.fail(
        new ValidationError('End date must be after start date')
      );
    }

    // Validate nutritional targets
    if (data.targetCalories <= 0) {
      return Result.fail(
        new ValidationError('Target calories must be positive')
      );
    }

    const dietPlan = DietPlan.create({
      clientId: data.clientId,
      dietitianId: data.dietitianId,
      name: data.name,
      description: data.description,
      status: 'DRAFT' as any,
      dateRange: { startDate: data.startDate, endDate: data.endDate } as any,
      nutritionalGoals: {
        calories: data.targetCalories,
        protein: data.targetProtein,
        carbohydrates: data.targetCarbs,
        fat: data.targetFat,
      } as any,
      isActive: true,
    });

    return Result.ok(dietPlan);
  }

  createFromTemplate(
    template: DietPlan,
    clientId: string,
    dietitianId: string
  ): Result<DietPlan, ValidationError> {
    return this.create({
      clientId,
      dietitianId,
      name: template.getName(),
      description: template.getDescription(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      targetCalories: template.getTargetCalories(),
      targetProtein: template.getTargetProtein(),
      targetCarbs: template.getTargetCarbs(),
      targetFat: template.getTargetFat(),
    });
  }
}

/**
 * Usage:
 * 
 * const userFactory = new UserFactory();
 * const userResult = userFactory.createDietitian({
 *   email: 'dietitian@example.com',
 *   password: 'SecurePass123!',
 *   firstName: 'John',
 *   lastName: 'Doe',
 * });
 * 
 * if (userResult.isSuccess()) {
 *   const user = userResult.getValue();
 *   await userRepository.save(user);
 * }
 */
