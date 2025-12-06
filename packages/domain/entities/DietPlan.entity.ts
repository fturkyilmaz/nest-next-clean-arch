import { DateRange } from '@domain/value-objects/DateRange.vo';

export enum DietPlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface NutritionalGoals {
  targetCalories?: number;
  targetProtein?: number; // grams
  targetCarbs?: number; // grams
  targetFat?: number; // grams
  targetFiber?: number; // grams
}

export interface DietPlanProps {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  dietitianId: string;
  dateRange: DateRange;
  status: DietPlanStatus;
  nutritionalGoals: NutritionalGoals;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * DietPlan Entity (Aggregate Root)
 * Represents a diet plan assigned to a client
 */
export class DietPlan {
  private props: DietPlanProps;

  private constructor(props: DietPlanProps) {
    this.props = props;
  }

  public static create(
    props: Omit<DietPlanProps, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'isActive'> & { isActive?: boolean }
  ): DietPlan {
    const now = new Date();
    return new DietPlan({
      ...props,
      id: '', // Will be set by repository
      version: 1,
      status: props.status ?? DietPlanStatus.DRAFT,
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: DietPlanProps): DietPlan {
    return new DietPlan(props);
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

  public getClientId(): string {
    return this.props.clientId;
  }

  public getDietitianId(): string {
    return this.props.dietitianId;
  }

  public getDateRange(): DateRange {
    return this.props.dateRange;
  }

  public getStatus(): DietPlanStatus {
    return this.props.status;
  }

  public getNutritionalGoals(): NutritionalGoals {
    return { ...this.props.nutritionalGoals };
  }

  // Convenience getters for nutritional goals
  public getTargetCalories(): number | undefined {
    return this.props.nutritionalGoals.targetCalories;
  }

  public getTargetProtein(): number | undefined {
    return this.props.nutritionalGoals.targetProtein;
  }

  public getTargetCarbs(): number | undefined {
    return this.props.nutritionalGoals.targetCarbs;
  }

  public getTargetFat(): number | undefined {
    return this.props.nutritionalGoals.targetFat;
  }

  public getTargetFiber(): number | undefined {
    return this.props.nutritionalGoals.targetFiber;
  }

  public getVersion(): number {
    return this.props.version;
  }

  public getStartDate(): Date {
    return this.props.dateRange.getStartDate();
  }

  public getEndDate(): Date | null {
    return this.props.dateRange.getEndDate();
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

  public getDeletedAt(): Date | undefined {
    return this.props.deletedAt;
  }

  // Business logic methods
  public isDraft(): boolean {
    return this.props.status === DietPlanStatus.DRAFT;
  }

  public isActiveStatus(): boolean {
    return this.props.status === DietPlanStatus.ACTIVE;
  }

  public isCompleted(): boolean {
    return this.props.status === DietPlanStatus.COMPLETED;
  }

  public isCancelled(): boolean {
    return this.props.status === DietPlanStatus.CANCELLED;
  }

  public isCurrentlyActive(): boolean {
    return this.props.status === DietPlanStatus.ACTIVE && this.props.dateRange.isActive();
  }

  public updateBasicInfo(name: string, description?: string): void {
    if (!name) {
      throw new Error('Diet plan name is required');
    }
    this.props.name = name;
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  public updateNutritionalGoals(goals: NutritionalGoals): void {
    // Validate goals
    if (goals.targetCalories !== undefined && goals.targetCalories < 0) {
      throw new Error('Target calories cannot be negative');
    }
    if (goals.targetProtein !== undefined && goals.targetProtein < 0) {
      throw new Error('Target protein cannot be negative');
    }
    if (goals.targetCarbs !== undefined && goals.targetCarbs < 0) {
      throw new Error('Target carbs cannot be negative');
    }
    if (goals.targetFat !== undefined && goals.targetFat < 0) {
      throw new Error('Target fat cannot be negative');
    }
    if (goals.targetFiber !== undefined && goals.targetFiber < 0) {
      throw new Error('Target fiber cannot be negative');
    }

    this.props.nutritionalGoals = { ...goals };
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    if (this.props.status === DietPlanStatus.CANCELLED) {
      throw new Error('Cannot activate a cancelled diet plan');
    }
    if (this.props.status === DietPlanStatus.COMPLETED) {
      throw new Error('Cannot activate a completed diet plan');
    }

    this.props.status = DietPlanStatus.ACTIVE;
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public complete(): void {
    if (this.props.status !== DietPlanStatus.ACTIVE) {
      throw new Error('Only active diet plans can be completed');
    }

    this.props.status = DietPlanStatus.COMPLETED;
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    if (this.props.status === DietPlanStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed diet plan');
    }

    this.props.status = DietPlanStatus.CANCELLED;
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public createNewVersion(): DietPlan {
    return DietPlan.create({
      name: this.props.name,
      description: this.props.description,
      clientId: this.props.clientId,
      dietitianId: this.props.dietitianId,
      dateRange: this.props.dateRange,
      status: DietPlanStatus.DRAFT,
      nutritionalGoals: this.props.nutritionalGoals,
      isActive: true,
    });
  }

  public softDelete(): void {
    this.props.deletedAt = new Date();
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public toJSON(): DietPlanProps {
    return { ...this.props };
  }
}
