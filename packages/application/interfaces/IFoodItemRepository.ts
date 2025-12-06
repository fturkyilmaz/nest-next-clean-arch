import { FoodItem } from '@domain/entities/FoodItem.entity';

export interface IFoodItemRepository {
  /**
   * Find food item by ID
   */
  findById(id: string): Promise<FoodItem | null>;

  /**
   * Find food item by name
   */
  findByName(name: string): Promise<FoodItem | null>;

  /**
   * Find all food items with optional filtering
   */
  findAll(filters?: {
    category?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }): Promise<FoodItem[]>;

  /**
   * Search food items by name
   */
  search(
    query: string,
    options?: {
      category?: string;
      skip?: number;
      take?: number;
    }
  ): Promise<FoodItem[]>;

  /**
   * Count food items with optional filtering
   */
  count(filters?: { category?: string; isActive?: boolean }): Promise<number>;

  /**
   * Create a new food item
   */
  create(foodItem: FoodItem): Promise<FoodItem>;

  /**
   * Update an existing food item
   */
  update(foodItem: FoodItem): Promise<FoodItem>;

  /**
   * Delete a food item
   */
  delete(id: string): Promise<void>;
}
