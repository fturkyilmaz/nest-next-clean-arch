// @domain/entities/Report.entity.ts

export interface ReportProps {
    id: string;
    title: string;
    description?: string;
    clientId?: string;
    dietitianId?: string;
    generatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class Report {
    private props: ReportProps;

    private constructor(props: ReportProps) {
        this.props = props;
    }

    /**
     * Yeni Report oluşturur
     */
    static create(props: Omit<ReportProps, 'createdAt' | 'updatedAt'>): Report {
        const now = new Date();
        return new Report({
            ...props,
            createdAt: now,
            updatedAt: now,
        });
    }

    /**
     * DB’den gelen veriyi domain entity’ye dönüştürür
     */
    static reconstitute(props: ReportProps): Report {
        return new Report(props);
    }

    // Getter’lar
    getId(): string {
        return this.props.id;
    }

    getTitle(): string {
        return this.props.title;
    }

    getDescription(): string | undefined {
        return this.props.description;
    }

    getClientId(): string | undefined {
        return this.props.clientId;
    }

    getDietitianId(): string | undefined {
        return this.props.dietitianId;
    }

    getGeneratedAt(): Date {
        return this.props.generatedAt;
    }

    getCreatedAt(): Date {
        return this.props.createdAt;
    }

    getUpdatedAt(): Date {
        return this.props.updatedAt;
    }

    // Persistence için plain object döner
    toJSON(): ReportProps {
        return { ...this.props };
    }
}
