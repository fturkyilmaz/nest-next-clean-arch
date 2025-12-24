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
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class FoodItem {
  private props: FoodItemProps;

  private constructor(props: FoodItemProps) {
    this.props = props;
  }

  /**
   * Yeni FoodItem oluşturur
   */
  static create(
    props: Omit<FoodItemProps, 'createdAt' | 'updatedAt' | 'isActive'>
  ): FoodItem {
    const now = new Date();
    return new FoodItem({
      ...props,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });
  }

  /**
   * DB’den gelen veriyi domain entity’ye dönüştürür
   */
  static reconstitute(props: FoodItemProps): FoodItem {
    return new FoodItem(props);
  }

  // Getter örnekleri
  getId(): string {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  getCategory(): FoodCategory {
    return this.props.category;
  }

  getCalories(): number {
    return this.props.calories;
  }

  getProtein(): number {
    return this.props.protein;
  }

  getCarbs(): number {
    return this.props.carbs;
  }

  getFat(): number {
    return this.props.fat;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Domain tarafında kullanılacak plain object
   */
  toJSON(): FoodItemProps {
    return { ...this.props };
  }

  /**
   * Prisma create/update için uygun plain object
   */
  toPrisma(): Record<string, any> {
    return {
      id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      category: this.props.category,
      servingSize: this.props.servingSize,
      servingUnit: this.props.servingUnit,
      calories: this.props.calories,
      protein: this.props.protein,
      carbs: this.props.carbs,
      fat: this.props.fat,
      fiber: this.props.fiber,
      sugar: this.props.sugar,
      sodium: this.props.sodium,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
