import { ICommand } from '@nestjs/cqrs';

export class RecordClientMetricsCommand implements ICommand {
  constructor(
    public readonly clientId: string,
    public readonly weight: number,
    public readonly height: number,
    public readonly bodyFat?: number,
    public readonly waist?: number,
    public readonly hip?: number,
    public readonly recordedAt?: Date,
    public readonly notes?: string
  ) {}
}
