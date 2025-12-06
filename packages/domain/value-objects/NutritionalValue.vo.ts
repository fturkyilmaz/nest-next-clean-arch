/**
 * NutritionalValue Value Object
 * Represents nutritional information with validation
 */
export interface NutritionalValueProps {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
}

export class NutritionalValue {
  private readonly props: Required<NutritionalValueProps>;

  private constructor(props: NutritionalValueProps) {
    this.props = {
      calories: props.calories,
      protein: props.protein,
      carbs: props.carbs,
      fat: props.fat,
      fiber: props.fiber ?? 0,
      sugar: props.sugar ?? 0,
      sodium: props.sodium ?? 0,
    };
  }

  public static create(props: NutritionalValueProps): NutritionalValue {
    // Validation
    if (props.calories < 0) throw new Error('Calories cannot be negative');
    if (props.protein < 0) throw new Error('Protein cannot be negative');
    if (props.carbs < 0) throw new Error('Carbs cannot be negative');
    if (props.fat < 0) throw new Error('Fat cannot be negative');
    if (props.fiber !== undefined && props.fiber < 0) {
      throw new Error('Fiber cannot be negative');
    }
    if (props.sugar !== undefined && props.sugar < 0) {
      throw new Error('Sugar cannot be negative');
    }
    if (props.sodium !== undefined && props.sodium < 0) {
      throw new Error('Sodium cannot be negative');
    }

    return new NutritionalValue(props);
  }

  public getCalories(): number {
    return this.props.calories;
  }

  public getProtein(): number {
    return this.props.protein;
  }

  public getCarbs(): number {
    return this.props.carbs;
  }

  public getFat(): number {
    return this.props.fat;
  }

  public getFiber(): number {
    return this.props.fiber;
  }

  public getSugar(): number {
    return this.props.sugar;
  }

  public getSodium(): number {
    return this.props.sodium;
  }

  /**
   * Add nutritional values together
   */
  public add(other: NutritionalValue): NutritionalValue {
    return NutritionalValue.create({
      calories: this.props.calories + other.props.calories,
      protein: this.props.protein + other.props.protein,
      carbs: this.props.carbs + other.props.carbs,
      fat: this.props.fat + other.props.fat,
      fiber: this.props.fiber + other.props.fiber,
      sugar: this.props.sugar + other.props.sugar,
      sodium: this.props.sodium + other.props.sodium,
    });
  }

  /**
   * Multiply nutritional values by a factor (for servings)
   */
  public multiply(factor: number): NutritionalValue {
    if (factor < 0) throw new Error('Factor cannot be negative');

    return NutritionalValue.create({
      calories: this.props.calories * factor,
      protein: this.props.protein * factor,
      carbs: this.props.carbs * factor,
      fat: this.props.fat * factor,
      fiber: this.props.fiber * factor,
      sugar: this.props.sugar * factor,
      sodium: this.props.sodium * factor,
    });
  }

  public toJSON(): Required<NutritionalValueProps> {
    return { ...this.props };
  }
}
