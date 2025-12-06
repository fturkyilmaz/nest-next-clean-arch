import { Result, ValidationError } from '@domain/common/Result';

/**
 * Abstract Report Generator Template
 */
export abstract class ReportGenerator<T> {
  /**
   * Template method - defines the algorithm structure
   */
  async generate(data: T): Promise<Result<string, ValidationError>> {
    const validationResult = await this.validate(data);
    if (validationResult.isFailure()) {
      return Result.fail(validationResult.getError());
    }

    const processedData = await this.processData(data);
    const formattedData = await this.formatData(processedData);
    const report = await this.buildReport(formattedData);
    
    await this.postProcess(report);

    return Result.ok(report);
  }

  // Abstract methods - must be implemented by subclasses
  protected abstract validate(data: T): Promise<Result<void, ValidationError>>;
  protected abstract processData(data: T): Promise<any>;
  protected abstract formatData(data: any): Promise<any>;
  protected abstract buildReport(data: any): Promise<string>;

  // Hook method - optional override
  protected async postProcess(report: string): Promise<void> {
    // Default: do nothing
  }
}

/**
 * Client Progress Report
 */
export class ClientProgressReport extends ReportGenerator<{ clientId: string; startDate: Date; endDate: Date }> {
  protected async validate(data: any): Promise<Result<void, ValidationError>> {
    if (!data.clientId) {
      return Result.fail(new ValidationError('Client ID is required'));
    }
    if (data.endDate <= data.startDate) {
      return Result.fail(new ValidationError('End date must be after start date'));
    }
    return Result.ok(undefined);
  }

  protected async processData(data: any): Promise<any> {
    // Fetch client metrics, diet plans, etc.
    return {
      clientId: data.clientId,
      metrics: [], // Fetch from repository
      dietPlans: [], // Fetch from repository
      period: { start: data.startDate, end: data.endDate },
    };
  }

  protected async formatData(data: any): Promise<any> {
    return {
      summary: {
        totalMetrics: data.metrics.length,
        totalDietPlans: data.dietPlans.length,
      },
      details: data.metrics.map((m: any) => ({
        date: m.recordedAt,
        weight: m.weight,
        bmi: m.bmi,
      })),
    };
  }

  protected async buildReport(data: any): Promise<string> {
    return `
      Client Progress Report
      =====================
      Period: ${data.period.start} - ${data.period.end}
      
      Summary:
      - Total Metrics: ${data.summary.totalMetrics}
      - Total Diet Plans: ${data.summary.totalDietPlans}
      
      Details:
      ${data.details.map((d: any) => `- ${d.date}: Weight ${d.weight}kg, BMI ${d.bmi}`).join('\n')}
    `;
  }

  protected async postProcess(report: string): Promise<void> {
    // Send email, save to file, etc.
    console.log('Report generated successfully');
  }
}

/**
 * Nutritional Summary Report
 */
export class NutritionalSummaryReport extends ReportGenerator<{ dietPlanId: string }> {
  protected async validate(data: any): Promise<Result<void, ValidationError>> {
    if (!data.dietPlanId) {
      return Result.fail(new ValidationError('Diet Plan ID is required'));
    }
    return Result.ok(undefined);
  }

  protected async processData(data: any): Promise<any> {
    // Fetch diet plan with meals
    return {
      dietPlanId: data.dietPlanId,
      meals: [], // Fetch from repository
      totalCalories: 0,
      totalProtein: 0,
    };
  }

  protected async formatData(data: any): Promise<any> {
    return {
      averageCalories: data.totalCalories / 7,
      averageProtein: data.totalProtein / 7,
      mealBreakdown: data.meals,
    };
  }

  protected async buildReport(data: any): Promise<string> {
    return `
      Nutritional Summary Report
      =========================
      Average Daily Calories: ${data.averageCalories}
      Average Daily Protein: ${data.averageProtein}g
    `;
  }
}

/**
 * Usage:
 * 
 * const progressReport = new ClientProgressReport();
 * const result = await progressReport.generate({
 *   clientId: '123',
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-01-31'),
 * });
 * 
 * if (result.isSuccess()) {
 *   console.log(result.getValue());
 * }
 */
