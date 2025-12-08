import { create } from "zustand";

interface UIState {
    // Sidebar state
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    // Modal state
    activeModal: string | null;
    // Theme
    theme: "light" | "dark" | "system";
    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    openModal: (modalId: string) => void;
    closeModal: () => void;
    setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()((set) => ({
    sidebarOpen: true,
    sidebarCollapsed: false,
    activeModal: null,
    theme: "system",

    toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setSidebarOpen: (sidebarOpen) =>
        set({ sidebarOpen }),

    setSidebarCollapsed: (sidebarCollapsed) =>
        set({ sidebarCollapsed }),

    openModal: (activeModal) =>
        set({ activeModal }),

    closeModal: () =>
        set({ activeModal: null }),

    setTheme: (theme) =>
        set({ theme }),
}));
