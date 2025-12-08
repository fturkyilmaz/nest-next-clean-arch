import { Email } from '@domain/value-objects/Email.vo';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface ClientProps {
  id: string;
  firstName: string;
  lastName: string;
  email: Email;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  dietitianId: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Client Entity (Aggregate Root)
 * Represents a client managed by a dietitian
 */
export class Client {
  private props: ClientProps;

  private constructor(props: ClientProps) {
    this.props = props;
  }

  public static create(
    props: Omit<ClientProps, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'allergies' | 'conditions' | 'medications'> & {
      allergies?: string[];
      conditions?: string[];
      medications?: string[];
      isActive?: boolean;
    }
  ): Client {
    const now = new Date();
    return new Client({
      ...props,
      id: '', // Will be set by repository
      allergies: props.allergies || [],
      conditions: props.conditions || [],
      medications: props.medications || [],
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: ClientProps): Client {
    return new Client(props);
  }

  // Getters
  public getId(): string {
    return this.props.id;
  }

  public getFirstName(): string {
    return this.props.firstName;
  }

  public getLastName(): string {
    return this.props.lastName;
  }

  public getFullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  public getEmail(): Email {
    return this.props.email;
  }

  public getPhone(): string | undefined {
    return this.props.phone;
  }

  public getDateOfBirth(): Date | undefined {
    return this.props.dateOfBirth;
  }

  public getGender(): Gender | undefined {
    return this.props.gender;
  }

  public getDietitianId(): string {
    return this.props.dietitianId;
  }

  public getAllergies(): string[] {
    return [...this.props.allergies];
  }

  public getConditions(): string[] {
    return [...this.props.conditions];
  }

  public getMedications(): string[] {
    return [...this.props.medications];
  }

  public getNotes(): string | undefined {
    return this.props.notes;
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
  public getAge(): number | undefined {
    if (!this.props.dateOfBirth) {
      return undefined;
    }

    const today = new Date();
    const birthDate = new Date(this.props.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  public updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: Date;
    gender?: Gender;
  }): void {
    if (data.firstName) this.props.firstName = data.firstName;
    if (data.lastName) this.props.lastName = data.lastName;
    if (data.phone !== undefined) this.props.phone = data.phone;
    if (data.dateOfBirth !== undefined) this.props.dateOfBirth = data.dateOfBirth;
    if (data.gender !== undefined) this.props.gender = data.gender;
    this.props.updatedAt = new Date();
  }

  public addAllergy(allergy: string): void {
    if (!allergy) {
      throw new Error('Allergy cannot be empty');
    }
    if (!this.props.allergies.includes(allergy)) {
      this.props.allergies.push(allergy);
      this.props.updatedAt = new Date();
    }
  }

  public removeAllergy(allergy: string): void {
    this.props.allergies = this.props.allergies.filter((a) => a !== allergy);
    this.props.updatedAt = new Date();
  }

  public addCondition(condition: string): void {
    if (!condition) {
      throw new Error('Condition cannot be empty');
    }
    if (!this.props.conditions.includes(condition)) {
      this.props.conditions.push(condition);
      this.props.updatedAt = new Date();
    }
  }

  public removeCondition(condition: string): void {
    this.props.conditions = this.props.conditions.filter((c) => c !== condition);
    this.props.updatedAt = new Date();
  }

  public addMedication(medication: string): void {
    if (!medication) {
      throw new Error('Medication cannot be empty');
    }
    if (!this.props.medications.includes(medication)) {
      this.props.medications.push(medication);
      this.props.updatedAt = new Date();
    }
  }

  public removeMedication(medication: string): void {
    this.props.medications = this.props.medications.filter((m) => m !== medication);
    this.props.updatedAt = new Date();
  }

  public updateNotes(notes: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  public assignToDietitian(dietitianId: string): void {
    if (!dietitianId) {
      throw new Error('Dietitian ID is required');
    }
    this.props.dietitianId = dietitianId;
    this.props.updatedAt = new Date();
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public softDelete(): void {
    this.props.deletedAt = new Date();
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public toJSON(): ClientProps {
    return { ...this.props };
  }
}
