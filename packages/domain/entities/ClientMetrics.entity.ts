import { Weight } from '../value-objects/Weight.vo';
import { Height } from '../value-objects/Height.vo';

export interface ClientMetricsProps {
  id: string;
  clientId: string;
  weight: Weight;
  height: Height;
  bmi: number;
  bodyFat?: number;
  waist?: number; // cm
  hip?: number; // cm
  recordedAt: Date;
  notes?: string;
  createdAt: Date;
}

/**
 * ClientMetrics Entity
 * Tracks client health metrics over time
 */
export class ClientMetrics {
  private props: ClientMetricsProps;

  private constructor(props: ClientMetricsProps) {
    this.props = props;
  }

  public static create(
    props: Omit<ClientMetricsProps, 'id' | 'bmi' | 'createdAt'>
  ): ClientMetrics {
    // Calculate BMI
    const bmi = props.weight.getKilograms() / Math.pow(props.height.getMeters(), 2);

    return new ClientMetrics({
      ...props,
      id: '', // Will be set by repository
      bmi: Math.round(bmi * 10) / 10,
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: ClientMetricsProps): ClientMetrics {
    return new ClientMetrics(props);
  }

  // Getters
  public getId(): string {
    return this.props.id;
  }

  public getClientId(): string {
    return this.props.clientId;
  }

  public getWeight(): Weight {
    return this.props.weight;
  }

  public getHeight(): Height {
    return this.props.height;
  }

  public getBMI(): number {
    return this.props.bmi;
  }

  public getBodyFat(): number | undefined {
    return this.props.bodyFat;
  }

  public getWaist(): number | undefined {
    return this.props.waist;
  }

  public getHip(): number | undefined {
    return this.props.hip;
  }

  public getWaistToHipRatio(): number | undefined {
    if (!this.props.waist || !this.props.hip) {
      return undefined;
    }
    return Math.round((this.props.waist / this.props.hip) * 100) / 100;
  }

  public getRecordedAt(): Date {
    return this.props.recordedAt;
  }

  public getNotes(): string | undefined {
    return this.props.notes;
  }

  public getCreatedAt(): Date {
    return this.props.createdAt;
  }

  public toJSON(): ClientMetricsProps {
    return { ...this.props };
  }
}
