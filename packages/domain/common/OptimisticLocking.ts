import { ConflictError } from '@domain/common/Result';

/**
 * Optimistic Locking for Concurrency Control
 * Prevents lost updates in concurrent scenarios
 */

export interface Versioned {
  version: number;
}

export class ConcurrencyError extends ConflictError {
  constructor(aggregateId: string, expectedVersion: number, actualVersion: number) {
    super(
      `Concurrency conflict for aggregate ${aggregateId}. Expected version ${expectedVersion}, but found ${actualVersion}`,
      {
        aggregateId,
        expectedVersion,
        actualVersion,
      }
    );
  }
}

/**
 * Base class for versioned aggregates
 */
export abstract class VersionedAggregate {
  protected version: number = 0;

  public getVersion(): number {
    return this.version;
  }

  protected incrementVersion(): void {
    this.version++;
  }

  protected checkVersion(expectedVersion: number): void {
    if (this.version !== expectedVersion) {
      throw new ConcurrencyError(
        this.getId(),
        expectedVersion,
        this.version
      );
    }
  }

  protected abstract getId(): string;
}

/**
 * Example: Versioned DietPlan
 */
export class VersionedDietPlan extends VersionedAggregate {
  private constructor(
    private readonly id: string,
    private name: string,
    private status: string,
    version: number
  ) {
    super();
    this.version = version;
  }

  public static create(id: string, name: string): VersionedDietPlan {
    return new VersionedDietPlan(id, name, 'DRAFT', 0);
  }

  public static reconstitute(
    id: string,
    name: string,
    status: string,
    version: number
  ): VersionedDietPlan {
    return new VersionedDietPlan(id, name, status, version);
  }

  protected getId(): string {
    return this.id;
  }

  /**
   * Update with optimistic locking
   */
  public updateName(newName: string, expectedVersion: number): void {
    this.checkVersion(expectedVersion);
    this.name = newName;
    this.incrementVersion();
  }

  /**
   * Activate with optimistic locking
   */
  public activate(expectedVersion: number): void {
    this.checkVersion(expectedVersion);
    
    if (this.status === 'ACTIVE') {
      throw new Error('Diet plan is already active');
    }

    this.status = 'ACTIVE';
    this.incrementVersion();
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      version: this.version,
    };
  }
}

/**
 * Repository with optimistic locking
 */
export interface IVersionedRepository<T extends VersionedAggregate> {
  findById(id: string): Promise<T | null>;
  save(aggregate: T, expectedVersion: number): Promise<void>;
}

/**
 * Usage:
 * 
 * const dietPlan = await repository.findById(id);
 * const currentVersion = dietPlan.getVersion();
 * 
 * try {
 *   dietPlan.updateName('New Name', currentVersion);
 *   await repository.save(dietPlan, currentVersion);
 * } catch (error) {
 *   if (error instanceof ConcurrencyError) {
 *     // Handle conflict - retry or notify user
 *   }
 * }
 */
