import { Weight } from '@domain/value-objects/Weight.vo';

describe('Weight Value Object', () => {
  describe('fromKilograms', () => {
    it('should create weight from kilograms', () => {
      const weight = Weight.fromKilograms(75);
      expect(weight.getKilograms()).toBe(75);
    });

    it('should throw error for negative weight', () => {
      expect(() => Weight.fromKilograms(-10)).toThrow('Weight must be positive');
    });

    it('should throw error for zero weight', () => {
      expect(() => Weight.fromKilograms(0)).toThrow('Weight must be positive');
    });
  });

  describe('fromPounds', () => {
    it('should create weight from pounds and convert to kg', () => {
      const weight = Weight.fromPounds(165.35); // ~75 kg
      expect(weight.getKilograms()).toBeCloseTo(75, 1);
    });
  });

  describe('conversion', () => {
    it('should convert kilograms to pounds correctly', () => {
      const weight = Weight.fromKilograms(75);
      expect(weight.getPounds()).toBeCloseTo(165.35, 2);
    });

    it('should maintain precision in conversions', () => {
      const original = 80.5;
      const weight = Weight.fromKilograms(original);
      const pounds = weight.getPounds();
      const backToKg = Weight.fromPounds(pounds);
      expect(backToKg.getKilograms()).toBeCloseTo(original, 1);
    });
  });
});
