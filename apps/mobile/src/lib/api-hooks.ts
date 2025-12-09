import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiClient, ApiService, LoginRequest, CreateClientRequest, CreateDietPlanRequest, ClientMetrics } from './api-client';

// Create API client for mobile
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const TOKEN_KEY = '@diet_app_token';
const REFRESH_TOKEN_KEY = '@diet_app_refresh_token';

let cachedToken: string | null = null;

async function getAccessToken(): Promise<string | null> {
    if (cachedToken) return cachedToken;
    try {
        cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
        return cachedToken;
    } catch {
        return null;
    }
}

export const apiClient = createApiClient({
    baseURL: API_BASE_URL,
    getAccessToken: () => cachedToken,
    onTokenExpired: async () => {
        await clearTokens();
        // Navigate to login - handled by auth context
    },
});

export const api = new ApiService(apiClient);

// Token management
export async function setTokens(accessToken: string, refreshToken: string) {
    cachedToken = accessToken;
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens() {
    cachedToken = null;
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

export async function loadStoredToken(): Promise<string | null> {
    cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
    return cachedToken;
}

// ============================================
// React Query Hooks for Mobile
// ============================================

export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: LoginRequest) => api.login(data),
        onSuccess: async (data) => {
            await setTokens(data.accessToken, data.refreshToken);
            queryClient.setQueryData(['currentUser'], data.user);
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => api.logout(),
        onSuccess: async () => {
            await clearTokens();
            queryClient.clear();
        },
    });
}

export function useCurrentUser() {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: () => api.getCurrentUser(),
        staleTime: 5 * 60 * 1000,
    });
}

export function useClients() {
    return useQuery({
        queryKey: ['clients'],
        queryFn: () => api.getClients(),
    });
}

export function useClient(id: string) {
    return useQuery({
        queryKey: ['clients', id],
        queryFn: () => api.getClientById(id),
        enabled: !!id,
    });
}

export function useCreateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateClientRequest) => api.createClient(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
}

export function useClientMetrics(clientId: string) {
    return useQuery({
        queryKey: ['clients', clientId, 'metrics'],
        queryFn: () => api.getClientMetrics(clientId),
        enabled: !!clientId,
    });
}

export function useAddClientMetrics(clientId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<ClientMetrics, 'id' | 'clientId' | 'recordedAt'>) =>
            api.addClientMetrics(clientId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'metrics'] });
        },
    });
}

export function useDietPlans() {
    return useQuery({
        queryKey: ['dietPlans'],
        queryFn: () => api.getDietPlans(),
    });
}

export function useDietPlan(id: string) {
    return useQuery({
        queryKey: ['dietPlans', id],
        queryFn: () => api.getDietPlanById(id),
        enabled: !!id,
    });
}

export function useClientDietPlans(clientId: string) {
    return useQuery({
        queryKey: ['clients', clientId, 'dietPlans'],
        queryFn: () => api.getClientDietPlans(clientId),
        enabled: !!clientId,
    });
}

export function useCreateDietPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDietPlanRequest) => api.createDietPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dietPlans'] });
        },
    });
}

export function useActivateDietPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.activateDietPlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dietPlans'] });
        },
    });
}

export function useCompleteDietPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.completeDietPlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dietPlans'] });
        },
    });
}

export function useHealthCheck() {
    return useQuery({
        queryKey: ['health'],
        queryFn: () => api.healthCheck(),
        staleTime: 30 * 1000,
    });
}
