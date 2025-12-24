export class UpdateClientCommand {
  constructor(
    public readonly id: string,
    public readonly payload: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      dateOfBirth?: Date;
      gender?: string;
      allergies?: string[];
      conditions?: string[];
      medications?: string[];
      notes?: string;
    }
  ) { }
}