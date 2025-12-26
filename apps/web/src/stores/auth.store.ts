import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "ADMIN" | "DIETITIAN" | "CLIENT";
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    // Actions
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    setRefreshToken: (token: string | null) => void;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: user !== null,
                }),

            setAccessToken: (accessToken) =>
                set({ accessToken }),

            setRefreshToken: (refreshToken) =>
                set({ refreshToken }),

            login: (user, accessToken, refreshToken) =>
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            logout: () => {
                // Clear all auth state
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
                // Clear localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-storage');
                }
            },

            setLoading: (isLoading) =>
                set({ isLoading }),

            hydrate: () => {
                // Called on app startup to restore auth state from storage
                const state = get();
                if (state.accessToken && state.user) {
                    set({ isLoading: false });
                } else {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isLoading = false;
                }
            },
        }
    )
);
