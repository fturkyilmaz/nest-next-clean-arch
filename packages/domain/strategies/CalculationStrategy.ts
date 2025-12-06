import { Weight } from '@domain/value-objects/Weight.vo';
import { Height } from '@domain/value-objects/Height.vo';

/**
 * Calorie Calculation Strategy Interface
 */
export interface ICalorieCalculationStrategy {
  calculate(params: {
    weight: Weight;
    height: Height;
    age: number;
    gender: string;
    activityLevel: string;
    goal: string;
  }): number;
}

/**
 * Harris-Benedict Formula Strategy
 */
export class HarrisBenedictStrategy implements ICalorieCalculationStrategy {
  calculate(params: any): number {
    const weight = params.weight.getKilograms();
    const height = params.height.getCentimeters();
    const age = params.age;

    // Calculate BMR
    let bmr: number;
    if (params.gender === 'MALE') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Apply activity multiplier
    const activityMultipliers: Record<string, number> = {
      SEDENTARY: 1.2,
      LIGHT: 1.375,
      MODERATE: 1.55,
      ACTIVE: 1.725,
      VERY_ACTIVE: 1.9,
    };

    const tdee = bmr * (activityMultipliers[params.activityLevel] || 1.55);

    // Adjust for goal
    const goalAdjustments: Record<string, number> = {
      WEIGHT_LOSS: -500,
      WEIGHT_GAIN: 500,
      MAINTAIN: 0,
    };

    return Math.round(tdee + (goalAdjustments[params.goal] || 0));
  }
}

/**
 * Mifflin-St Jeor Formula Strategy
 */
export class MifflinStJeorStrategy implements ICalorieCalculationStrategy {
  calculate(params: any): number {
    const weight = params.weight.getKilograms();
    const height = params.height.getCentimeters();
    const age = params.age;

    // Calculate BMR
    let bmr: number;
    if (params.gender === 'MALE') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Apply activity multiplier
    const activityMultipliers: Record<string, number> = {
      SEDENTARY: 1.2,
      LIGHT: 1.375,
      MODERATE: 1.55,
      ACTIVE: 1.725,
      VERY_ACTIVE: 1.9,
    };

    const tdee = bmr * (activityMultipliers[params.activityLevel] || 1.55);

    // Adjust for goal
    const goalAdjustments: Record<string, number> = {
      WEIGHT_LOSS: -500,
      WEIGHT_GAIN: 500,
      MAINTAIN: 0,
    };

    return Math.round(tdee + (goalAdjustments[params.goal] || 0));
  }
}

/**
 * Calorie Calculator Context
 */
export class CalorieCalculator {
  constructor(private strategy: ICalorieCalculationStrategy) {}

  setStrategy(strategy: ICalorieCalculationStrategy): void {
    this.strategy = strategy;
  }

  calculate(params: any): number {
    return this.strategy.calculate(params);
  }
}

/**
 * Macro Distribution Strategy Interface
 */
export interface IMacroDistributionStrategy {
  distribute(totalCalories: number): {
    protein: number;
    carbs: number;
    fat: number;
  };
}

/**
 * Balanced Macro Strategy (40/30/30)
 */
export class BalancedMacroStrategy implements IMacroDistributionStrategy {
  distribute(totalCalories: number) {
    return {
      protein: Math.round((totalCalories * 0.3) / 4), // 4 cal/g
      carbs: Math.round((totalCalories * 0.4) / 4),
      fat: Math.round((totalCalories * 0.3) / 9), // 9 cal/g
    };
  }
}

/**
 * High Protein Strategy (40/30/30)
 */
export class HighProteinMacroStrategy implements IMacroDistributionStrategy {
  distribute(totalCalories: number) {
    return {
      protein: Math.round((totalCalories * 0.4) / 4),
      carbs: Math.round((totalCalories * 0.3) / 4),
      fat: Math.round((totalCalories * 0.3) / 9),
    };
  }
}

/**
 * Low Carb Strategy (30/20/50)
 */
export class LowCarbMacroStrategy implements IMacroDistributionStrategy {
  distribute(totalCalories: number) {
    return {
      protein: Math.round((totalCalories * 0.3) / 4),
      carbs: Math.round((totalCalories * 0.2) / 4),
      fat: Math.round((totalCalories * 0.5) / 9),
    };
  }
}

/**
 * Usage:
 * 
 * // Calorie calculation
 * const calculator = new CalorieCalculator(new MifflinStJeorStrategy());
 * const calories = calculator.calculate({
 *   weight: Weight.fromKilograms(75),
 *   height: Height.fromCentimeters(175),
 *   age: 30,
 *   gender: 'MALE',
 *   activityLevel: 'MODERATE',
 *   goal: 'WEIGHT_LOSS',
 * });
 * 
 * // Switch strategy
 * calculator.setStrategy(new HarrisBenedictStrategy());
 * const newCalories = calculator.calculate(params);
 * 
 * // Macro distribution
 * const macroStrategy = new HighProteinMacroStrategy();
 * const macros = macroStrategy.distribute(2000);
 */
