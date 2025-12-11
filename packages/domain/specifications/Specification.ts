/**
 * Specification Pattern for complex business rules
 * Allows composable, reusable business logic
 */
export interface ISpecification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: ISpecification<T>): ISpecification<T>;
  or(other: ISpecification<T>): ISpecification<T>;
  not(): ISpecification<T>;
}

export abstract class Specification<T> implements ISpecification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, other);
  }

  or(other: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, other);
  }

  not(): ISpecification<T> {
    return new NotSpecification(this);
  }
}

class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: ISpecification<T>,
    private readonly right: ISpecification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: ISpecification<T>,
    private readonly right: ISpecification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends Specification<T> {
  constructor(private readonly spec: ISpecification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}

/**
 * Example: Client eligibility specifications
 */
export class ClientAgeSpecification extends Specification<{ dateOfBirth: Date }> {
  constructor(private readonly minAge: number, private readonly maxAge: number) {
    super();
  }

  isSatisfiedBy(client: { dateOfBirth: Date }): boolean {
    const age = this.calculateAge(client.dateOfBirth);
    return age >= this.minAge && age <= this.maxAge;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();

    const hasBirthdayPassedThisYear =
      today.getMonth() > dateOfBirth.getMonth() ||
      (today.getMonth() === dateOfBirth.getMonth() && today.getDate() >= dateOfBirth.getDate());

    if (!hasBirthdayPassedThisYear) {
      age--;
    }

    return age;
  }
}

export class ClientBMIRangeSpecification extends Specification<{ bmi: number }> {
  constructor(private readonly minBMI: number, private readonly maxBMI: number) {
    super();
  }

  isSatisfiedBy(client: { bmi: number }): boolean {
    return client.bmi >= this.minBMI && client.bmi <= this.maxBMI;
  }
}

export class ClientHasAllergiesSpecification extends Specification<{ allergies: string[] }> {
  isSatisfiedBy(client: { allergies: string[] }): boolean {
    return Array.isArray(client.allergies) && client.allergies.length > 0;
  }
}

/**
 * Usage example:
 * 
 * const adultSpec = new ClientAgeSpecification(18, 65);
 * const healthyBMISpec = new ClientBMIRangeSpecification(18.5, 24.9);
 * const hasAllergiesSpec = new ClientHasAllergiesSpecification();
 * 
 * const eligibleForStandardPlan = adultSpec
 *   .and(healthyBMISpec)
 *   .and(hasAllergiesSpec.not());
 * 
 * if (eligibleForStandardPlan.isSatisfiedBy(client)) {
 *   // Assign standard diet plan
 * }
 */
