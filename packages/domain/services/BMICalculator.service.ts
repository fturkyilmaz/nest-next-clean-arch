import { Weight } from '@domain/value-objects/Weight.vo';
import { Height } from '@domain/value-objects/Height.vo';

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  isHealthy: boolean;
}

export enum BMICategory {
  UNDERWEIGHT = 'UNDERWEIGHT',
  NORMAL = 'NORMAL',
  OVERWEIGHT = 'OVERWEIGHT',
  OBESE_CLASS_1 = 'OBESE_CLASS_1',
  OBESE_CLASS_2 = 'OBESE_CLASS_2',
  OBESE_CLASS_3 = 'OBESE_CLASS_3',
}

/**
 * BMI Calculator Domain Service
 * Calculates BMI and provides health categorization
 */
export class BMICalculatorService {
  /**
   * Calculate BMI from weight and height
   * Formula: BMI = weight (kg) / (height (m))^2
   */
  public static calculate(weight: Weight, height: Height): BMIResult {
    const weightKg = weight.getKilograms();
    const heightM = height.getMeters();

    const bmi = weightKg / (heightM * heightM);
    const category = this.categorize(bmi);
    const isHealthy = category === BMICategory.NORMAL;

    return {
      bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
      category,
      isHealthy,
    };
  }

  /**
   * Categorize BMI value according to WHO standards
   */
  private static categorize(bmi: number): BMICategory {
    if (bmi < 18.5) {
      return BMICategory.UNDERWEIGHT;
    } else if (bmi >= 18.5 && bmi < 25) {
      return BMICategory.NORMAL;
    } else if (bmi >= 25 && bmi < 30) {
      return BMICategory.OVERWEIGHT;
    } else if (bmi >= 30 && bmi < 35) {
      return BMICategory.OBESE_CLASS_1;
    } else if (bmi >= 35 && bmi < 40) {
      return BMICategory.OBESE_CLASS_2;
    } else {
      return BMICategory.OBESE_CLASS_3;
    }
  }

  /**
   * Calculate ideal weight range for a given height
   * Based on BMI 18.5-24.9 (normal range)
   */
  public static calculateIdealWeightRange(height: Height): { min: Weight; max: Weight } {
    const heightM = height.getMeters();
    const minWeightKg = 18.5 * (heightM * heightM);
    const maxWeightKg = 24.9 * (heightM * heightM);

    return {
      min: Weight.fromKilograms(minWeightKg),
      max: Weight.fromKilograms(maxWeightKg),
    };
  }
}
