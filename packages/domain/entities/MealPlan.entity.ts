export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface MealPlanProps {
  id: string;
  dietPlanId: string;
  dayOfWeek: DayOfWeek;
  date?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MealPlan Entity
 * Represents a day's meal plan within a diet plan
 */
export class MealPlan {
  private props: MealPlanProps;

  private constructor(props: MealPlanProps) {
    this.props = props;
  }

  public static create(
    props: Omit<MealPlanProps, 'id' | 'createdAt' | 'updatedAt'>
  ): MealPlan {
    const now = new Date();
    return new MealPlan({
      ...props,
      id: '', // Will be set by repository
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: MealPlanProps): MealPlan {
    return new MealPlan(props);
  }

  // Getters
  public getId(): string {
    return this.props.id;
  }

  public getDietPlanId(): string {
    return this.props.dietPlanId;
  }

  public getDayOfWeek(): DayOfWeek {
    return this.props.dayOfWeek;
  }

  public getDate(): Date | undefined {
    return this.props.date;
  }

  public getNotes(): string | undefined {
    return this.props.notes;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic
  public updateNotes(notes: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  public setDate(date: Date): void {
    this.props.date = date;
    this.props.updatedAt = new Date();
  }

  public toJSON(): MealPlanProps {
    return { ...this.props };
  }
}
