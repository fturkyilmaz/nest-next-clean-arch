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
  OTHER = 'OTHER'
};


export interface FoodItemProps {
  id: string; name: string; description?: string;
  category: FoodCategory; servingSize: number; servingUnit: string;
  calories: number; protein: number; carbs: number; fat: number;
  fiber?: number; sugar?: number; sodium?: number;
  isActive: boolean; createdAt: Date; updatedAt: Date;
}

export class FoodItem {
  private props: FoodItemProps;
  private constructor(props: FoodItemProps) { this.props = props; }

  static create(props: Omit<FoodItemProps, 'createdAt' | 'updatedAt'>): FoodItem {
    const now = new Date();
    return new FoodItem({ ...props, createdAt: now, updatedAt: now, isActive: true });
  }
  static reconstitute(props: FoodItemProps): FoodItem {
    return new FoodItem(props);
  }

  getId() { return this.props.id; }
  toJSON(): FoodItemProps { return { ...this.props }; }
}