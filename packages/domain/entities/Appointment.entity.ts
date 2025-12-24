export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export interface AppointmentProps {
  id: string;
  clientId: string;
  dietitianId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class Appointment {
  private props: AppointmentProps;

  private constructor(props: AppointmentProps) {
    this.props = props;
  }

  static create(props: Omit<AppointmentProps, 'createdAt' | 'updatedAt' | 'status'>): Appointment {
    const now = new Date();
    return new Appointment({ ...props, createdAt: now, updatedAt: now, status: AppointmentStatus.SCHEDULED });
  }

  static reconstitute(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }

  getId(): string { return this.props.id; }
  getClientId(): string { return this.props.clientId; }
  getDietitianId(): string { return this.props.dietitianId; }
  getStatus(): AppointmentStatus { return this.props.status; }
  toJSON(): AppointmentProps { return { ...this.props }; }
}
