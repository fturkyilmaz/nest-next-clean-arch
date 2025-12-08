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
    isAuthenticated: boolean;
    isLoading: boolean;
    // Actions
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    login: (user: User, token: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: user !== null,
                }),

            setAccessToken: (accessToken) =>
                set({ accessToken }),

            login: (user, accessToken) =>
                set({
                    user,
                    accessToken,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                }),

            setLoading: (isLoading) =>
                set({ isLoading }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
