import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    getAccessToken?: () => string | null;
    onTokenExpired?: () => void;
    onError?: (error: ApiError) => void;
}

/**
 * API Error Response (RFC 7807)
 */
export interface ApiError {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    timestamp?: string;
    errors?: Record<string, string[]>;
}

// ============================================
// API Types
// ============================================

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'DIETITIAN' | 'CLIENT';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dietitianId: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ClientMetrics {
    id: string;
    clientId: string;
    weight: number;
    height: number;
    bmi?: number;
    bodyFat?: number;
    waist?: number;
    hip?: number;
    recordedAt: string;
    notes?: string;
}

export interface DietPlan {
    id: string;
    name: string;
    description?: string;
    clientId: string;
    dietitianId: string;
    startDate: string;
    endDate?: string;
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
    targetFiber?: number;
    version: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface CreateClientRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    dietitianId: string;
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
    notes?: string;
}

export interface CreateDietPlanRequest {
    name: string;
    description?: string;
    clientId: string;
    startDate: string;
    endDate?: string;
    nutritionalGoals?: {
        targetCalories?: number;
        targetProtein?: number;
        targetCarbs?: number;
        targetFat?: number;
        targetFiber?: number;
    };
}

/**
 * Create configured API client instance
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
    const client = axios.create({
        baseURL: config.baseURL,
        timeout: config.timeout || 30000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor - add auth token
    client.interceptors.request.use(
        (requestConfig) => {
            const token = config.getAccessToken?.();
            if (token) {
                requestConfig.headers.Authorization = `Bearer ${token}`;
            }
            return requestConfig;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError<ApiError>) => {
            if (error.response) {
                const apiError = error.response.data;

                // Handle 401 - token expired
                if (error.response.status === 401) {
                    config.onTokenExpired?.();
                }

                config.onError?.(apiError);
                return Promise.reject(apiError);
            }

            // Network error
            const networkError: ApiError = {
                type: 'https://httpstatuses.com/0',
                title: 'Network Error',
                status: 0,
                detail: error.message || 'Unable to connect to server',
            };
            config.onError?.(networkError);
            return Promise.reject(networkError);
        }
    );

    return client;
}

/**
 * API Service
 */
export class ApiService {
    constructor(private client: AxiosInstance) { }

    // Auth
    async login(data: LoginRequest): Promise<LoginResponse> {
        const res = await this.client.post<LoginResponse>('/auth/login', data);
        return res.data;
    }

    async refreshToken(refreshToken: string): Promise<LoginResponse> {
        const res = await this.client.post<LoginResponse>('/auth/refresh', { refreshToken });
        return res.data;
    }

    async logout(): Promise<void> {
        await this.client.post('/auth/logout');
    }

    // Users
    async getCurrentUser(): Promise<User> {
        const res = await this.client.get<User>('/users/me/profile');
        return res.data;
    }

    async getUsers(): Promise<User[]> {
        const res = await this.client.get<User[]>('/users');
        return res.data;
    }

    async getUserById(id: string): Promise<User> {
        const res = await this.client.get<User>(`/users/${id}`);
        return res.data;
    }

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        const res = await this.client.put<User>(`/users/${id}`, data);
        return res.data;
    }

    // Clients
    async getClients(): Promise<Client[]> {
        const res = await this.client.get<Client[]>('/clients');
        return res.data;
    }

    async getClientById(id: string): Promise<Client> {
        const res = await this.client.get<Client>(`/clients/${id}`);
        return res.data;
    }

    async createClient(data: CreateClientRequest): Promise<Client> {
        const res = await this.client.post<Client>('/clients', data);
        return res.data;
    }

    async updateClient(id: string, data: Partial<CreateClientRequest>): Promise<Client> {
        const res = await this.client.put<Client>(`/clients/${id}`, data);
        return res.data;
    }

    async getClientMetrics(clientId: string): Promise<ClientMetrics[]> {
        const res = await this.client.get<ClientMetrics[]>(`/clients/${clientId}/metrics`);
        return res.data;
    }

    async addClientMetrics(clientId: string, data: Omit<ClientMetrics, 'id' | 'clientId' | 'recordedAt'>): Promise<ClientMetrics> {
        const res = await this.client.post<ClientMetrics>(`/clients/${clientId}/metrics`, data);
        return res.data;
    }

    // Diet Plans
    async getDietPlans(): Promise<DietPlan[]> {
        const res = await this.client.get<DietPlan[]>('/diet-plans');
        return res.data;
    }

    async getDietPlanById(id: string): Promise<DietPlan> {
        const res = await this.client.get<DietPlan>(`/diet-plans/${id}`);
        return res.data;
    }

    async getClientDietPlans(clientId: string): Promise<DietPlan[]> {
        const res = await this.client.get<DietPlan[]>(`/clients/${clientId}/diet-plans`);
        return res.data;
    }

    async createDietPlan(data: CreateDietPlanRequest): Promise<DietPlan> {
        const res = await this.client.post<DietPlan>('/diet-plans', data);
        return res.data;
    }

    async updateDietPlan(id: string, data: Partial<CreateDietPlanRequest>): Promise<DietPlan> {
        const res = await this.client.put<DietPlan>(`/diet-plans/${id}`, data);
        return res.data;
    }

    async activateDietPlan(id: string): Promise<DietPlan> {
        const res = await this.client.post<DietPlan>(`/diet-plans/${id}/activate`);
        return res.data;
    }

    async completeDietPlan(id: string): Promise<DietPlan> {
        const res = await this.client.post<DietPlan>(`/diet-plans/${id}/complete`);
        return res.data;
    }

    // Health
    async healthCheck(): Promise<{ status: string }> {
        const res = await this.client.get<{ status: string }>('/health');
        return res.data;
    }
}
