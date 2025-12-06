import { BMICalculator, BMICategory } from '@domain/services/BMICalculator.service';
import { Weight } from '@domain/value-objects/Weight.vo';
import { Height } from '@domain/value-objects/Height.vo';

describe('BMICalculator Service', () => {
  let calculator: BMICalculator;

  beforeEach(() => {
    calculator = new BMICalculator();
  });

  describe('calculateBMI', () => {
    it('should calculate BMI correctly', () => {
      const weight = Weight.fromKilograms(75);
      const height = Height.fromCentimeters(175);
      const bmi = calculator.calculateBMI(weight, height);
      expect(bmi).toBeCloseTo(24.49, 2);
    });

    it('should handle different weight units', () => {
      const weight = Weight.fromPounds(165);
      const height = Height.fromCentimeters(175);
      const bmi = calculator.calculateBMI(weight, height);
      expect(bmi).toBeGreaterThan(0);
    });
  });

  describe('categorizeBMI', () => {
    it('should categorize underweight correctly', () => {
      const category = calculator.categorizeBMI(17);
      expect(category).toBe(BMICategory.UNDERWEIGHT);
    });

    it('should categorize normal weight correctly', () => {
      const category = calculator.categorizeBMI(22);
      expect(category).toBe(BMICategory.NORMAL);
    });

    it('should categorize overweight correctly', () => {
      const category = calculator.categorizeBMI(27);
      expect(category).toBe(BMICategory.OVERWEIGHT);
    });

    it('should categorize obese correctly', () => {
      const category = calculator.categorizeBMI(32);
      expect(category).toBe(BMICategory.OBESE);
    });
  });

  describe('calculateIdealWeightRange', () => {
    it('should calculate ideal weight range for height', () => {
      const height = Height.fromCentimeters(175);
      const range = calculator.calculateIdealWeightRange(height);
      
      expect(range.min).toBeGreaterThan(0);
      expect(range.max).toBeGreaterThan(range.min);
      expect(range.min).toBeCloseTo(56.7, 1);
      expect(range.max).toBeCloseTo(76.6, 1);
    });
  });
});
