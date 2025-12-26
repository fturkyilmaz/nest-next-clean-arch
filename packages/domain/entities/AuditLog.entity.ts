export interface AuditLogProps {
    id: string;
    userId?: string | null;
    action: string;
    entity: string;
    entityId: string;
    changes?: string;
    metadata?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

export class AuditLog {
    private props: AuditLogProps;

    private constructor(props: AuditLogProps) {
        this.props = props;
    }

    /**
     * Yeni AuditLog oluşturur
     */
    static create(props: Omit<AuditLogProps, 'createdAt'>): AuditLog {
        return new AuditLog({
            ...props,
            createdAt: new Date(),
        });
    }

    /**
     * DB’den gelen veriyi domain entity’ye dönüştürür
     */
    static reconstitute(props: AuditLogProps): AuditLog {
        return new AuditLog(props);
    }

    // Getter’lar
    getId(): string {
        return this.props.id;
    }

    getUserId(): string | null | undefined {
        return this.props.userId;
    }

    getAction(): string {
        return this.props.action;
    }

    getEntity(): string {
        return this.props.entity;
    }

    getEntityId(): string {
        return this.props.entityId;
    }

    getCreatedAt(): Date {
        return this.props.createdAt;
    }

    // Persistence için plain object döner
    toJSON(): AuditLogProps {
        return { ...this.props };
    }
}
