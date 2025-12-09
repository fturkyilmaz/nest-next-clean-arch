/**
 * Base interface for all domain events
 */
export interface IDomainEvent {
    readonly eventId: string;
    readonly occurredOn: Date;
    readonly aggregateId: string;
    readonly aggregateType: string;
    readonly eventType: string;
    readonly version: number;
    readonly metadata?: Record<string, unknown>;
}

/**
 * Abstract base class for domain events
 */
export abstract class DomainEvent implements IDomainEvent {
    public readonly eventId: string;
    public readonly occurredOn: Date;
    public readonly version: number;
    public abstract readonly aggregateId: string;
    public abstract readonly aggregateType: string;
    public abstract readonly eventType: string;
    public readonly metadata?: Record<string, unknown>;

    constructor(metadata?: Record<string, unknown>) {
        this.eventId = crypto.randomUUID();
        this.occurredOn = new Date();
        this.version = 1;
        this.metadata = metadata;
    }

    /**
     * Serialize event to JSON for storage/messaging
     */
    public toJSON(): Record<string, unknown> {
        return {
            eventId: this.eventId,
            occurredOn: this.occurredOn.toISOString(),
            aggregateId: this.aggregateId,
            aggregateType: this.aggregateType,
            eventType: this.eventType,
            version: this.version,
            metadata: this.metadata,
            payload: this.getPayload(),
        };
    }

    /**
     * Get the event-specific payload
     */
    protected abstract getPayload(): Record<string, unknown>;
}

/**
 * Interface for entities that can emit domain events
 */
export interface IAggregateRoot {
    domainEvents: IDomainEvent[];
    addDomainEvent(event: IDomainEvent): void;
    clearDomainEvents(): IDomainEvent[];
}
