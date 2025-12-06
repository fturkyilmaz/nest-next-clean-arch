import { NutritionalValue } from '@domain/value-objects/NutritionalValue.vo';

export interface DailyNutritionalRequirements {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
}

export interface NutritionalComplianceResult {
  isCompliant: boolean;
  caloriesCompliance: number; // percentage
  proteinCompliance: number; // percentage
  carbsCompliance: number; // percentage
  fatCompliance: number; // percentage
  fiberCompliance: number; // percentage
  warnings: string[];
}

/**
 * Nutritional Calculator Domain Service
 * Calculates daily nutritional requirements and compliance
 */
export class NutritionalCalculatorService {
  /**
   * Calculate daily caloric needs using Mifflin-St Jeor Equation
   * @param weight - in kg
   * @param height - in cm
   * @param age - in years
   * @param gender - 'MALE' or 'FEMALE'
   * @param activityLevel - 1.2 (sedentary) to 1.9 (very active)
   */
  public static calculateDailyCalories(
    weight: number,
    height: number,
    age: number,
    gender: 'MALE' | 'FEMALE',
    activityLevel: number = 1.2
  ): number {
    // Mifflin-St Jeor Equation
    let bmr: number;

    if (gender === 'MALE') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Apply activity level
    const tdee = bmr * activityLevel;

    return Math.round(tdee);
  }

  /**
   * Calculate macronutrient distribution
   * Default: 30% protein, 40% carbs, 30% fat
   */
  public static calculateMacronutrients(
    totalCalories: number,
    proteinPercentage: number = 30,
    carbsPercentage: number = 40,
    fatPercentage: number = 30
  ): DailyNutritionalRequirements {
    // Validate percentages
    const total = proteinPercentage + carbsPercentage + fatPercentage;
    if (Math.abs(total - 100) > 0.1) {
      throw new Error('Macronutrient percentages must sum to 100');
    }

    // Calculate grams
    // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
    const proteinGrams = (totalCalories * (proteinPercentage / 100)) / 4;
    const carbsGrams = (totalCalories * (carbsPercentage / 100)) / 4;
    const fatGrams = (totalCalories * (fatPercentage / 100)) / 9;

    // Fiber: 14g per 1000 calories (recommended)
    const fiberGrams = (totalCalories / 1000) * 14;

    return {
      calories: totalCalories,
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbsGrams),
      fat: Math.round(fatGrams),
      fiber: Math.round(fiberGrams),
    };
  }

  /**
   * Check compliance with nutritional goals
   */
  public static checkCompliance(
    actual: NutritionalValue,
    target: DailyNutritionalRequirements,
    tolerance: number = 10 // percentage
  ): NutritionalComplianceResult {
    const warnings: string[] = [];

    // Calculate compliance percentages
    const caloriesCompliance = (actual.getCalories() / target.calories) * 100;
    const proteinCompliance = (actual.getProtein() / target.protein) * 100;
    const carbsCompliance = (actual.getCarbs() / target.carbs) * 100;
    const fatCompliance = (actual.getFat() / target.fat) * 100;
    const fiberCompliance = (actual.getFiber() / target.fiber) * 100;

    // Check if within tolerance
    const isCaloriesCompliant = this.isWithinTolerance(caloriesCompliance, 100, tolerance);
    const isProteinCompliant = this.isWithinTolerance(proteinCompliance, 100, tolerance);
    const isCarbsCompliant = this.isWithinTolerance(carbsCompliance, 100, tolerance);
    const isFatCompliant = this.isWithinTolerance(fatCompliance, 100, tolerance);
    const isFiberCompliant = fiberCompliance >= 80; // At least 80% of fiber goal

    // Generate warnings
    if (!isCaloriesCompliant) {
      if (caloriesCompliance < 100 - tolerance) {
        warnings.push('Calories are significantly below target');
      } else {
        warnings.push('Calories are significantly above target');
      }
    }

    if (!isProteinCompliant) {
      warnings.push('Protein intake is not within target range');
    }

    if (!isCarbsCompliant) {
      warnings.push('Carbohydrate intake is not within target range');
    }

    if (!isFatCompliant) {
      warnings.push('Fat intake is not within target range');
    }

    if (!isFiberCompliant) {
      warnings.push('Fiber intake is below recommended levels');
    }

    const isCompliant =
      isCaloriesCompliant &&
      isProteinCompliant &&
      isCarbsCompliant &&
      isFatCompliant &&
      isFiberCompliant;

    return {
      isCompliant,
      caloriesCompliance: Math.round(caloriesCompliance),
      proteinCompliance: Math.round(proteinCompliance),
      carbsCompliance: Math.round(carbsCompliance),
      fatCompliance: Math.round(fatCompliance),
      fiberCompliance: Math.round(fiberCompliance),
      warnings,
    };
  }

  private static isWithinTolerance(
    actual: number,
    target: number,
    tolerance: number
  ): boolean {
    const lowerBound = target - tolerance;
    const upperBound = target + tolerance;
    return actual >= lowerBound && actual <= upperBound;
  }

  /**
   * Sum nutritional values from multiple food items
   */
  public static sumNutritionalValues(values: NutritionalValue[]): NutritionalValue {
    if (values.length === 0) {
      return NutritionalValue.create({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      });
    }

    return values.reduce((sum, current) => sum.add(current));
  }
}
