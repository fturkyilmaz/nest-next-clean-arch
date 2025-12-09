import { DomainEvent } from './DomainEvent';

// ============================================
// User Events
// ============================================

export class UserCreatedEvent extends DomainEvent {
    public readonly aggregateType = 'User';
    public readonly eventType = 'UserCreated';

    constructor(
        public readonly aggregateId: string,
        public readonly email: string,
        public readonly role: string,
        public readonly firstName: string,
        public readonly lastName: string,
        metadata?: Record<string, unknown>
    ) {
        super(metadata);
    }

    protected getPayload(): Record<string, unknown> {
        return {
            email: this.email,
            role: this.role,
            firstName: this.firstName,
            lastName: this.lastName,
        };
    }
}

export class UserDeactivatedEvent extends DomainEvent {
    public readonly aggregateType = 'User';
    public readonly eventType = 'UserDeactivated';

    constructor(
        public readonly aggregateId: string,
        public readonly reason?: string,
        metadata?: Record<string, unknown>
    ) {
        super(metadata);
    }

    protected getPayload(): Record<string, unknown> {
        return { reason: this.reason };
    }
}

// ============================================
// Client Events
// ============================================

export class ClientCreatedEvent extends DomainEvent {
    public readonly aggregateType = 'Client';
    public readonly eventType = 'ClientCreated';

    constructor(
        public readonly aggregateId: string,
        public readonly email: string,
        public readonly dietitianId: string,
        public readonly firstName: string,
        public readonly lastName: string,
        metadata?: Record<string, unknown>
    ) {
        super(metadata);
    }

    protected getPayload(): Record<string, unknown> {
        return {
            email: this.email,
            dietitianId: this.dietitianId,
            firstName: this.firstName,
            lastName: this.lastName,
        };
    }
}

export class ClientAssignedToDietitianEvent extends DomainEvent {
    public readonly aggregateType = 'Client';
    public readonly eventType = 'ClientAssignedToDietitian';

    constructor(
        public readonly aggregateId: string,
        public readonly previousDietitianId: string,
        public readonly newDietitianId: string,
        metadata?: Record<string, unknown>
    ) {
        super(metadata);
    }

    protected getPayload(): Record<string, unknown> {
        return {
            previousDietitianId: this.previousDietitianId,
            newDietitianId: this.newDietitianId,
        };
    }
}

// ============================================
// Diet Plan Events
// ============================================

export class DietPlanCreatedEvent extends DomainEvent {
    public readonly aggregateType = 'DietPlan';
    public readonly eventType = 'DietPlanCreated';

    constructor(
        public readonly aggregateId: string,
        public readonly clientId: string,
        public readonly dietitianId: string,
        public readonly name: string,
        metadata?: Record<string, unknown>
    ) {
        super(metadata);
    }

    protected getPayload(): Record<string, unknown> {
        return {
            clientId: this.clientId,
            dietitianId: this.dietitianId,
            name: this.name,
        };
    }
}

export class DietPlanActivatedEvent extends DomainEvent {
    public readonly aggregateType = 'DietPlan';
    public readonly eventType = 'DietPlanActivated';

    constructor(
        public readonly aggregateId: string,
        public readonly clientId: string,
        metadata?: Record<string, unknown>
    ) {
        super(metadata);
    }

    protected getPayload(): Record<string, unknown> {
        return { clientId: this.clientId };
    }
}

export class DietPlanCompletedEvent extends DomainEvent {
    public readonly aggregateType = 'DietPlan';
    public readonly eventType = 'DietPlanCompleted';

    constructor(
        public readonly aggregateId: string,
        public readonly clientId: string,
        metadata?: Record<string, unknown>
    ) {
        super(metadata);
    }

    protected getPayload(): Record<string, unknown> {
        return { clientId: this.clientId };
    }
}

export class DietPlanCancelledEvent extends DomainEvent {
    public readonly aggregateType = 'DietPlan';
    public readonly eventType = 'DietPlanCancelled';

    constructor(
        public readonly aggregateId: string,
        public readonly clientId: string,
        public readonly reason?: string,
        metadata?: Record<string, unknown>
    ) {
        super(metadata);
    }

    protected getPayload(): Record<string, unknown> {
        return {
            clientId: this.clientId,
            reason: this.reason,
        };
    }
}
