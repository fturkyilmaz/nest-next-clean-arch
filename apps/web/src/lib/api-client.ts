import axios, { AxiosInstance, AxiosError } from "axios";

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
  role: "ADMIN" | "DIETITIAN" | "CLIENT";
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
  gender?: "MALE" | "FEMALE" | "OTHER";
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
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
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

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "ADMIN" | "DIETITIAN" | "CLIENT";
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dietitianId: string;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  notes?: string;
}

// ============================================
// New Types - Appointments, Foods, Meals, Events, Reports, Audits, Metrics
// ============================================

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  dietitianId: string;
  scheduledAt: string;
  duration: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface Food {
  id: string;
  name: string;
  category?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealFood {
  id: string;
  mealId: string;
  foodId: string;
  quantity: number;
  food?: Food;
}

export interface Meal {
  id: string;
  name: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  dietPlanId: string;
  scheduledTime?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  foods: MealFood[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  title: string;
  reportType: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Audit {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
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
      "Content-Type": "application/json",
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
        type: "https://httpstatuses.com/0",
        title: "Network Error",
        status: 0,
        detail: error.message || "Unable to connect to server",
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
  constructor(private client: AxiosInstance) {}

  // Auth
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await this.client.post<LoginResponse>("/auth/login", data);
    return res.data;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await this.client.post<RegisterResponse>(
      "/auth/register",
      data
    );
    return res.data;
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const res = await this.client.post<LoginResponse>("/auth/refresh", {
      refreshToken,
    });
    return res.data;
  }

  async logout(): Promise<void> {
    await this.client.post("/auth/logout");
  }

  // Users
  async getCurrentUser(): Promise<User> {
    const res = await this.client.get<User>("/users/me/profile");
    return res.data;
  }

  async getUsers(): Promise<User[]> {
    const res = await this.client.get<User[]>("/users");
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

  async createUser(data: CreateUserRequest): Promise<User> {
    const res = await this.client.post<User>("/users", data);
    return res.data;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    const res = await this.client.get<Client[]>("/clients");
    return res.data;
  }

  async getClientById(id: string): Promise<Client> {
    const res = await this.client.get<Client>(`/clients/${id}`);
    return res.data;
  }

  async createClient(data: CreateClientRequest): Promise<Client> {
    const res = await this.client.post<Client>("/clients", data);
    return res.data;
  }

  async updateClient(
    id: string,
    data: Partial<CreateClientRequest>
  ): Promise<Client> {
    const res = await this.client.put<Client>(`/clients/${id}`, data);
    return res.data;
  }

  async getClientMetrics(clientId: string): Promise<ClientMetrics[]> {
    const res = await this.client.get<ClientMetrics[]>(
      `/clients/${clientId}/metrics`
    );
    return res.data;
  }

  async addClientMetrics(
    clientId: string,
    data: Omit<ClientMetrics, "id" | "clientId" | "recordedAt">
  ): Promise<ClientMetrics> {
    const res = await this.client.post<ClientMetrics>(
      `/clients/${clientId}/metrics`,
      data
    );
    return res.data;
  }

  // Diet Plans
  async getDietPlans(): Promise<DietPlan[]> {
    const res = await this.client.get<DietPlan[]>("/diet-plans");
    return res.data;
  }

  async getDietPlanById(id: string): Promise<DietPlan> {
    const res = await this.client.get<DietPlan>(`/diet-plans/${id}`);
    return res.data;
  }

  async getClientDietPlans(clientId: string): Promise<DietPlan[]> {
    const res = await this.client.get<DietPlan[]>(
      `/clients/${clientId}/diet-plans`
    );
    return res.data;
  }

  async createDietPlan(data: CreateDietPlanRequest): Promise<DietPlan> {
    const res = await this.client.post<DietPlan>("/diet-plans", data);
    return res.data;
  }

  async updateDietPlan(
    id: string,
    data: Partial<CreateDietPlanRequest>
  ): Promise<DietPlan> {
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

  // ============================================
  // Appointments
  // ============================================

  async getAppointments(): Promise<Appointment[]> {
    const res = await this.client.get<Appointment[]>("/appointments");
    return res.data;
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    const res = await this.client.get<Appointment>(`/appointments/${id}`);
    return res.data;
  }

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    const res = await this.client.post<Appointment>("/appointments", data);
    return res.data;
  }

  // ============================================
  // Foods
  // ============================================

  async getFoods(): Promise<Food[]> {
    const res = await this.client.get<Food[]>("/foods");
    return res.data;
  }

  async getFoodById(id: string): Promise<Food> {
    const res = await this.client.get<Food>(`/foods/${id}`);
    return res.data;
  }

  async createFood(data: Partial<Food>): Promise<Food> {
    const res = await this.client.post<Food>("/foods", data);
    return res.data;
  }

  async updateFood(id: string, data: Partial<Food>): Promise<Food> {
    const res = await this.client.put<Food>(`/foods/${id}`, data);
    return res.data;
  }

  // ============================================
  // Meals
  // ============================================

  async getMeals(): Promise<Meal[]> {
    const res = await this.client.get<Meal[]>("/meals");
    return res.data;
  }

  async getMealById(id: string): Promise<Meal> {
    const res = await this.client.get<Meal>(`/meals/${id}`);
    return res.data;
  }

  async createMeal(data: Partial<Meal>): Promise<Meal> {
    const res = await this.client.post<Meal>("/meals", data);
    return res.data;
  }

  // ============================================
  // Events
  // ============================================

  async getEvents(): Promise<Event[]> {
    const res = await this.client.get<Event[]>("/events");
    return res.data;
  }

  async getEventById(id: string): Promise<Event> {
    const res = await this.client.get<Event>(`/events/${id}`);
    return res.data;
  }

  async createEvent(data: Partial<Event>): Promise<Event> {
    const res = await this.client.post<Event>("/events", data);
    return res.data;
  }

  // ============================================
  // Reports
  // ============================================

  async getReports(): Promise<Report[]> {
    const res = await this.client.get<Report[]>("/reports");
    return res.data;
  }

  async getReportById(id: string): Promise<Report> {
    const res = await this.client.get<Report>(`/reports/${id}`);
    return res.data;
  }

  // ============================================
  // Audits (Activity Logs)
  // ============================================

  async getAudits(): Promise<Audit[]> {
    const res = await this.client.get<Audit[]>("/audits");
    return res.data;
  }

  async getAuditById(id: string): Promise<Audit> {
    const res = await this.client.get<Audit>(`/audits/${id}`);
    return res.data;
  }

  // ============================================
  // Metrics
  // ============================================

  async getMetrics(): Promise<Metric[]> {
    const res = await this.client.get<Metric[]>("/metrics");
    return res.data;
  }

  async getMetricById(id: string): Promise<Metric> {
    const res = await this.client.get<Metric>(`/metrics/${id}`);
    return res.data;
  }

  // Health
  async healthCheck(): Promise<{ status: string }> {
    const res = await this.client.get<{ status: string }>("/health");
    return res.data;
  }
}
