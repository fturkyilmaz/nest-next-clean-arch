/**
 * Height Value Object
 * Handles height with unit conversion
 */
export class Height {
  private readonly centimeters: number;

  private constructor(cm: number) {
    this.centimeters = cm;
  }

  public static fromCentimeters(cm: number): Height {
    if (cm <= 0) {
      throw new Error('Height must be greater than 0');
    }
    if (cm < 50 || cm > 300) {
      throw new Error('Height seems unrealistic (must be between 50-300cm)');
    }
    return new Height(cm);
  }

  public static fromInches(inches: number): Height {
    if (inches <= 0) {
      throw new Error('Height must be greater than 0');
    }
    const cm = inches * 2.54;
    return new Height(cm);
  }

  public static fromFeetAndInches(feet: number, inches: number): Height {
    if (feet < 0 || inches < 0) {
      throw new Error('Height values must be positive');
    }
    const totalInches = feet * 12 + inches;
    return Height.fromInches(totalInches);
  }

  public getCentimeters(): number {
    return this.centimeters;
  }

  public getInches(): number {
    return this.centimeters / 2.54;
  }

  public getMeters(): number {
    return this.centimeters / 100;
  }

  public equals(other: Height): boolean {
    return Math.abs(this.centimeters - other.centimeters) < 0.1;
  }
}
