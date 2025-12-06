import { NutritionalValue } from '../value-objects/NutritionalValue.vo';

export enum FoodCategory {
  VEGETABLES = 'VEGETABLES',
  FRUITS = 'FRUITS',
  GRAINS = 'GRAINS',
  PROTEIN = 'PROTEIN',
  DAIRY = 'DAIRY',
  FATS_OILS = 'FATS_OILS',
  BEVERAGES = 'BEVERAGES',
  SNACKS = 'SNACKS',
  CONDIMENTS = 'CONDIMENTS',
  OTHER = 'OTHER',
}

export interface FoodItemProps {
  id: string;
  name: string;
  description?: string;
  category: FoodCategory;
  servingSize: number; // in grams
  servingUnit: string; // e.g., "cup", "piece", "tbsp"
  nutritionalValue: NutritionalValue;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * FoodItem Entity
 * Represents a food item in the database
 */
export class FoodItem {
  private props: FoodItemProps;

  private constructor(props: FoodItemProps) {
    this.props = props;
  }

  public static create(props: Omit<FoodItemProps, 'id' | 'createdAt' | 'updatedAt'>): FoodItem {
    const now = new Date();
    return new FoodItem({
      ...props,
      id: '', // Will be set by repository
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: FoodItemProps): FoodItem {
    return new FoodItem(props);
  }

  // Getters
  public getId(): string {
    return this.props.id;
  }

  public getName(): string {
    return this.props.name;
  }

  public getDescription(): string | undefined {
    return this.props.description;
  }

  public getCategory(): FoodCategory {
    return this.props.category;
  }

  public getServingSize(): number {
    return this.props.servingSize;
  }

  public getServingUnit(): string {
    return this.props.servingUnit;
  }

  public getNutritionalValue(): NutritionalValue {
    return this.props.nutritionalValue;
  }

  public isActive(): boolean {
    return this.props.isActive;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic methods
  public getNutritionalValueForServings(servings: number): NutritionalValue {
    if (servings <= 0) {
      throw new Error('Servings must be greater than 0');
    }
    return this.props.nutritionalValue.multiply(servings);
  }

  public updateBasicInfo(name: string, description?: string): void {
    if (!name) {
      throw new Error('Food item name is required');
    }
    this.props.name = name;
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  public updateCategory(category: FoodCategory): void {
    this.props.category = category;
    this.props.updatedAt = new Date();
  }

  public updateServingInfo(servingSize: number, servingUnit: string): void {
    if (servingSize <= 0) {
      throw new Error('Serving size must be greater than 0');
    }
    if (!servingUnit) {
      throw new Error('Serving unit is required');
    }
    this.props.servingSize = servingSize;
    this.props.servingUnit = servingUnit;
    this.props.updatedAt = new Date();
  }

  public updateNutritionalValue(nutritionalValue: NutritionalValue): void {
    this.props.nutritionalValue = nutritionalValue;
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public toJSON(): FoodItemProps {
    return { ...this.props };
  }
}
