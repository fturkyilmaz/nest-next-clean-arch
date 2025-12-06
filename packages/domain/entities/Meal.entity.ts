import { NutritionalValue } from '@domain/value-objects/NutritionalValue.vo';

export enum TimeOfDay {
  BREAKFAST = 'BREAKFAST',
  MORNING_SNACK = 'MORNING_SNACK',
  LUNCH = 'LUNCH',
  AFTERNOON_SNACK = 'AFTERNOON_SNACK',
  DINNER = 'DINNER',
  EVENING_SNACK = 'EVENING_SNACK',
}

export interface MealFoodItem {
  foodItemId: string;
  quantity: number;
  notes?: string;
}

export interface MealProps {
  id: string;
  mealPlanId: string;
  name: string;
  timeOfDay: TimeOfDay;
  description?: string;
  instructions?: string;
  foodItems: MealFoodItem[];
  nutritionalValue: NutritionalValue;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Meal Entity
 * Represents a single meal in a meal plan
 */
export class Meal {
  private props: MealProps;

  private constructor(props: MealProps) {
    this.props = props;
  }

  public static create(
    props: Omit<MealProps, 'id' | 'createdAt' | 'updatedAt' | 'foodItems'>
  ): Meal {
    const now = new Date();
    return new Meal({
      ...props,
      id: '', // Will be set by repository
      foodItems: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: MealProps): Meal {
    return new Meal(props);
  }

  // Getters
  public getId(): string {
    return this.props.id;
  }

  public getMealPlanId(): string {
    return this.props.mealPlanId;
  }

  public getName(): string {
    return this.props.name;
  }

  public getTimeOfDay(): TimeOfDay {
    return this.props.timeOfDay;
  }

  public getDescription(): string | undefined {
    return this.props.description;
  }

  public getInstructions(): string | undefined {
    return this.props.instructions;
  }

  public getFoodItems(): MealFoodItem[] {
    return [...this.props.foodItems];
  }

  public getNutritionalValue(): NutritionalValue {
    return this.props.nutritionalValue;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic
  public addFoodItem(foodItemId: string, quantity: number, notes?: string): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    this.props.foodItems.push({ foodItemId, quantity, notes });
    this.props.updatedAt = new Date();
  }

  public removeFoodItem(foodItemId: string): void {
    this.props.foodItems = this.props.foodItems.filter((item) => item.foodItemId !== foodItemId);
    this.props.updatedAt = new Date();
  }

  public updateNutritionalValue(nutritionalValue: NutritionalValue): void {
    this.props.nutritionalValue = nutritionalValue;
    this.props.updatedAt = new Date();
  }

  public toJSON(): MealProps {
    return { ...this.props };
  }
}
