export interface DietPlanTemplateProps {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., "Weight Loss", "Muscle Gain", "Diabetes", "Vegan"
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
  durationDays: number;
  isActive: boolean;
  createdBy: string; // dietitian or admin
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DietPlanTemplate Entity
 * Represents a reusable diet plan template
 */
export class DietPlanTemplate {
  private props: DietPlanTemplateProps;

  private constructor(props: DietPlanTemplateProps) {
    this.props = props;
  }

  public static create(
    props: Omit<DietPlanTemplateProps, 'id' | 'createdAt' | 'updatedAt'>
  ): DietPlanTemplate {
    const now = new Date();
    return new DietPlanTemplate({
      ...props,
      id: '',
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: DietPlanTemplateProps): DietPlanTemplate {
    return new DietPlanTemplate(props);
  }

  // Getters
  public getId(): string {
    return this.props.id;
  }

  public getName(): string {
    return this.props.name;
  }

  public getDescription(): string {
    return this.props.description;
  }

  public getCategory(): string {
    return this.props.category;
  }

  public getNutritionalGoals() {
    return {
      targetCalories: this.props.targetCalories,
      targetProtein: this.props.targetProtein,
      targetCarbs: this.props.targetCarbs,
      targetFat: this.props.targetFat,
      targetFiber: this.props.targetFiber,
    };
  }

  public getDurationDays(): number {
    return this.props.durationDays;
  }

  public isActive(): boolean {
    return this.props.isActive;
  }

  public getCreatedBy(): string {
    return this.props.createdBy;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic
  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public toJSON(): DietPlanTemplateProps {
    return { ...this.props };
  }
}
