import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus Metrics Service
 * Provides application-level metrics for monitoring and alerting
 */
@Injectable()
export class MetricsService implements OnModuleInit {
    private readonly registry: Registry;

    // HTTP metrics
    public readonly httpRequestsTotal: Counter;
    public readonly httpRequestDuration: Histogram;
    public readonly httpActiveRequests: Gauge;

    // Business metrics
    public readonly usersTotal: Gauge;
    public readonly clientsTotal: Gauge;
    public readonly dietPlansActive: Gauge;
    public readonly dietPlansCreated: Counter;

    // Database metrics
    public readonly dbQueryDuration: Histogram;
    public readonly dbConnectionPoolSize: Gauge;
    public readonly dbConnectionPoolUsed: Gauge;

    // Auth metrics
    public readonly authLoginAttempts: Counter;
    public readonly authLoginSuccess: Counter;
    public readonly authLoginFailure: Counter;

    constructor() {
        this.registry = new Registry();

        // Set default labels
        this.registry.setDefaultLabels({
            app: 'diet-management-api',
            version: process.env.npm_package_version || '1.0.0',
        });

        // HTTP Request counter
        this.httpRequestsTotal = new Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'path', 'status'],
            registers: [this.registry],
        });

        // HTTP Request duration histogram
        this.httpRequestDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'HTTP request duration in seconds',
            labelNames: ['method', 'path', 'status'],
            buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
            registers: [this.registry],
        });

        // Active HTTP requests
        this.httpActiveRequests = new Gauge({
            name: 'http_active_requests',
            help: 'Number of active HTTP requests',
            labelNames: ['method'],
            registers: [this.registry],
        });

        // Business metrics
        this.usersTotal = new Gauge({
            name: 'business_users_total',
            help: 'Total number of users',
            labelNames: ['role', 'status'],
            registers: [this.registry],
        });

        this.clientsTotal = new Gauge({
            name: 'business_clients_total',
            help: 'Total number of clients',
            labelNames: ['status'],
            registers: [this.registry],
        });

        this.dietPlansActive = new Gauge({
            name: 'business_diet_plans_active',
            help: 'Number of active diet plans',
            registers: [this.registry],
        });

        this.dietPlansCreated = new Counter({
            name: 'business_diet_plans_created_total',
            help: 'Total diet plans created',
            registers: [this.registry],
        });

        // Database metrics
        this.dbQueryDuration = new Histogram({
            name: 'db_query_duration_seconds',
            help: 'Database query duration in seconds',
            labelNames: ['operation', 'model'],
            buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
            registers: [this.registry],
        });

        this.dbConnectionPoolSize = new Gauge({
            name: 'db_connection_pool_size',
            help: 'Database connection pool size',
            registers: [this.registry],
        });

        this.dbConnectionPoolUsed = new Gauge({
            name: 'db_connection_pool_used',
            help: 'Database connections in use',
            registers: [this.registry],
        });

        // Auth metrics
        this.authLoginAttempts = new Counter({
            name: 'auth_login_attempts_total',
            help: 'Total login attempts',
            registers: [this.registry],
        });

        this.authLoginSuccess = new Counter({
            name: 'auth_login_success_total',
            help: 'Successful logins',
            registers: [this.registry],
        });

        this.authLoginFailure = new Counter({
            name: 'auth_login_failure_total',
            help: 'Failed logins',
            labelNames: ['reason'],
            registers: [this.registry],
        });
    }

    onModuleInit() {
        // Collect default Node.js metrics
        collectDefaultMetrics({ register: this.registry });
        console.log('📊 Prometheus metrics initialized');
    }

    /**
     * Get all metrics in Prometheus format
     */
    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }

    /**
     * Get metrics content type
     */
    getContentType(): string {
        return this.registry.contentType;
    }

    /**
     * Record HTTP request metrics
     */
    recordHttpRequest(method: string, path: string, status: number, durationMs: number): void {
        const normalizedPath = this.normalizePath(path);
        this.httpRequestsTotal.inc({ method, path: normalizedPath, status: status.toString() });
        this.httpRequestDuration.observe(
            { method, path: normalizedPath, status: status.toString() },
            durationMs / 1000
        );
    }

    /**
     * Record database query metrics
     */
    recordDbQuery(operation: string, model: string, durationMs: number): void {
        this.dbQueryDuration.observe({ operation, model }, durationMs / 1000);
    }

    /**
     * Normalize path to reduce cardinality
     */
    private normalizePath(path: string): string {
        // Replace UUIDs and IDs with placeholder
        return path
            .replace(/\/[a-f0-9-]{36}/gi, '/:id')
            .replace(/\/\d+/g, '/:id')
            .replace(/\?.*$/, '');
    }
}
