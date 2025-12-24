import { ClientMetrics } from "@domain/entities";

export interface IClientMetricsRepository {
    findByClientId(clientId: string, skip?: number, take?: number): Promise<ClientMetrics[]>;
}