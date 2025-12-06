/**
 * DateRange Value Object
 * Represents a date range with validation
 */
export class DateRange {
  private readonly startDate: Date;
  private readonly endDate: Date | null;

  private constructor(startDate: Date, endDate: Date | null) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  public static create(startDate: Date, endDate?: Date): DateRange {
    if (!startDate) {
      throw new Error('Start date is required');
    }

    if (endDate && endDate < startDate) {
      throw new Error('End date cannot be before start date');
    }

    return new DateRange(startDate, endDate ?? null);
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date | null {
    return this.endDate;
  }

  public isActive(date: Date = new Date()): boolean {
    if (date < this.startDate) {
      return false;
    }

    if (this.endDate && date > this.endDate) {
      return false;
    }

    return true;
  }

  public getDurationInDays(): number | null {
    if (!this.endDate) {
      return null;
    }

    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  public contains(date: Date): boolean {
    if (date < this.startDate) {
      return false;
    }

    if (this.endDate && date > this.endDate) {
      return false;
    }

    return true;
  }
}
