export interface EventLogProps {
    id: string;
    name: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    clientId?: string;
    dietitianId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class EventLog {
    private props: EventLogProps;

    private constructor(props: EventLogProps) {
        this.props = props;
    }

    /**
     * Yeni EventLog oluşturur
     */
    static create(props: Omit<EventLogProps, 'createdAt' | 'updatedAt'>): EventLog {
        const now = new Date();
        return new EventLog({
            ...props,
            createdAt: now,
            updatedAt: now,
        });
    }

    /**
     * DB’den gelen veriyi domain entity’ye dönüştürür
     */
    static reconstitute(props: EventLogProps): EventLog {
        return new EventLog(props);
    }

    // Getter’lar
    getId(): string {
        return this.props.id;
    }

    getName(): string {
        return this.props.name;
    }

    getStartDate(): Date {
        return this.props.startDate;
    }

    getEndDate(): Date | undefined {
        return this.props.endDate;
    }

    getLocation(): string | undefined {
        return this.props.location;
    }

    getClientId(): string | undefined {
        return this.props.clientId;
    }

    getDietitianId(): string | undefined {
        return this.props.dietitianId;
    }

    getCreatedAt(): Date {
        return this.props.createdAt;
    }

    getUpdatedAt(): Date {
        return this.props.updatedAt;
    }

    // Persistence için plain object döner
    toJSON(): EventLogProps {
        return { ...this.props };
    }
}
