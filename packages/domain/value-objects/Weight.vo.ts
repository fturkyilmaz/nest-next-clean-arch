/**
 * Weight Value Object
 * Handles weight with unit conversion
 */
export class Weight {
  private readonly kilograms: number;

  private constructor(kg: number) {
    this.kilograms = kg;
  }

  public static fromKilograms(kg: number): Weight {
    if (kg <= 0) {
      throw new Error('Weight must be greater than 0');
    }
    if (kg > 500) {
      throw new Error('Weight seems unrealistic (max 500kg)');
    }
    return new Weight(kg);
  }

  public static fromPounds(lbs: number): Weight {
    if (lbs <= 0) {
      throw new Error('Weight must be greater than 0');
    }
    const kg = lbs * 0.453592;
    return new Weight(kg);
  }

  public getKilograms(): number {
    return this.kilograms;
  }

  public getPounds(): number {
    return this.kilograms / 0.453592;
  }

  public equals(other: Weight): boolean {
    return Math.abs(this.kilograms - other.kilograms) < 0.01;
  }
}
