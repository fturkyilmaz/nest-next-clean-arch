export { DomainEvent, type IDomainEvent, type IAggregateRoot } from './DomainEvent';
export {
    // User events
    UserCreatedEvent,
    UserDeactivatedEvent,
    // Client events
    ClientCreatedEvent,
    ClientAssignedToDietitianEvent,
    // Diet plan events
    DietPlanCreatedEvent,
    DietPlanActivatedEvent,
    DietPlanCompletedEvent,
    DietPlanCancelledEvent,
} from './events';
