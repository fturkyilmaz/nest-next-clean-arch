import { Email } from '../value-objects/Email.vo';
import { Password } from '../value-objects/Password.vo';

export enum UserRole {
  ADMIN = 'ADMIN',
  DIETITIAN = 'DIETITIAN',
  CLIENT = 'CLIENT',
}

export interface UserProps {
  id: string;
  email: Email;
  password: Password;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * User Entity (Aggregate Root)
 * Represents a user in the system (Admin, Dietitian, or Client)
 */
export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  public static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): User {
    const now = new Date();
    return new User({
      ...props,
      id: '', // Will be set by repository
      createdAt: now,
      updatedAt: now,
      isActive: props.isActive ?? true,
    });
  }

  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // Getters
  public getId(): string {
    return this.props.id;
  }

  public getEmail(): Email {
    return this.props.email;
  }

  public getPassword(): Password {
    return this.props.password;
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

  public getRole(): UserRole {
    return this.props.role;
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
  public isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  public isDietitian(): boolean {
    return this.props.role === UserRole.DIETITIAN;
  }

  public isClient(): boolean {
    return this.props.role === UserRole.CLIENT;
  }

  public updateEmail(email: Email): void {
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  public updatePassword(password: Password): void {
    this.props.password = password;
    this.props.updatedAt = new Date();
  }

  public updateProfile(firstName: string, lastName: string): void {
    if (!firstName || !lastName) {
      throw new Error('First name and last name are required');
    }
    this.props.firstName = firstName;
    this.props.lastName = lastName;
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

  public toJSON(): UserProps {
    return { ...this.props };
  }
}
