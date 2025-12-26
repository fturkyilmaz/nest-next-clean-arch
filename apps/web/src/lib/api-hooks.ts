"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createApiClient,
  ApiService,
  LoginRequest,
  CreateClientRequest,
  CreateDietPlanRequest,
  ClientMetrics,
  RegisterRequest,
  CreateUserRequest,
} from "./api-client";

// Create API client for web
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

let tokenStorage: { accessToken: string | null; refreshToken: string | null } =
  {
    accessToken: null,
    refreshToken: null,
  };

export const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  getAccessToken: () => tokenStorage.accessToken,
  onTokenExpired: () => {
    tokenStorage = { accessToken: null, refreshToken: null };
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
});

export const api = new ApiService(apiClient);

// Token management
export function setTokens(accessToken: string, refreshToken: string) {
  tokenStorage = { accessToken, refreshToken };
}

export function clearTokens() {
  tokenStorage = { accessToken: null, refreshToken: null };
}

export function getTokens() {
  return tokenStorage;
}

// ============================================
// React Query Hooks
// ============================================

// Auth
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => api.login(data),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterRequest) => api.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
    },
  });
}

// Users
export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => api.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.getUsers(),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => api.getUserById(id),
    enabled: !!id,
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<any>) => api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Clients
export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => api.getClients(),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => api.getClientById(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientRequest) => api.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateClientRequest>) =>
      api.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", id] });
    },
  });
}

export function useClientMetrics(clientId: string) {
  return useQuery({
    queryKey: ["clients", clientId, "metrics"],
    queryFn: () => api.getClientMetrics(clientId),
    enabled: !!clientId,
  });
}

export function useAddClientMetrics(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ClientMetrics, "id" | "clientId" | "recordedAt">) =>
      api.addClientMetrics(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients", clientId, "metrics"],
      });
    },
  });
}

// Diet Plans
export function useDietPlans() {
  return useQuery({
    queryKey: ["dietPlans"],
    queryFn: () => api.getDietPlans(),
  });
}

export function useDietPlan(id: string) {
  return useQuery({
    queryKey: ["dietPlans", id],
    queryFn: () => api.getDietPlanById(id),
    enabled: !!id,
  });
}

export function useClientDietPlans(clientId: string) {
  return useQuery({
    queryKey: ["clients", clientId, "dietPlans"],
    queryFn: () => api.getClientDietPlans(clientId),
    enabled: !!clientId,
  });
}

export function useCreateDietPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDietPlanRequest) => api.createDietPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietPlans"] });
    },
  });
}

export function useUpdateDietPlan(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateDietPlanRequest>) =>
      api.updateDietPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietPlans"] });
      queryClient.invalidateQueries({ queryKey: ["dietPlans", id] });
    },
  });
}

export function useActivateDietPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.activateDietPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietPlans"] });
    },
  });
}

export function useCompleteDietPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.completeDietPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dietPlans"] });
    },
  });
}

// ============================================
// Appointments
// ============================================

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: () => api.getAppointments(),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointments", id],
    queryFn: () => api.getAppointmentById(id),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<any>) => api.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

// ============================================
// Foods
// ============================================

export function useFoods() {
  return useQuery({
    queryKey: ["foods"],
    queryFn: () => api.getFoods(),
  });
}

export function useFood(id: string) {
  return useQuery({
    queryKey: ["foods", id],
    queryFn: () => api.getFoodById(id),
    enabled: !!id,
  });
}

export function useCreateFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<any>) => api.createFood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });
}

export function useUpdateFood(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<any>) => api.updateFood(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      queryClient.invalidateQueries({ queryKey: ["foods", id] });
    },
  });
}

// ============================================
// Meals
// ============================================

export function useMeals() {
  return useQuery({
    queryKey: ["meals"],
    queryFn: () => api.getMeals(),
  });
}

export function useMeal(id: string) {
  return useQuery({
    queryKey: ["meals", id],
    queryFn: () => api.getMealById(id),
    enabled: !!id,
  });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<any>) => api.createMeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}

// ============================================
// Events
// ============================================

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => api.getEvents(),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => api.getEventById(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<any>) => api.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// ============================================
// Reports
// ============================================

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: () => api.getReports(),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ["reports", id],
    queryFn: () => api.getReportById(id),
    enabled: !!id,
  });
}

//============================================
// Audits (Activity Logs)
// ============================================

export function useAudits() {
  return useQuery({
    queryKey: ["audits"],
    queryFn: () => api.getAudits(),
  });
}

export function useAudit(id: string) {
  return useQuery({
    queryKey: ["audits", id],
    queryFn: () => api.getAuditById(id),
    enabled: !!id,
  });
}

// ============================================
// Metrics
// ============================================

export function useMetrics() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: () => api.getMetrics(),
  });
}

export function useMetric(id: string) {
  return useQuery({
    queryKey: ["metrics", id],
    queryFn: () => api.getMetricById(id),
    enabled: !!id,
  });
}

// Health
export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => api.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
  });
}
