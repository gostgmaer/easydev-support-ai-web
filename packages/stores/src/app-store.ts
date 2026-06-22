import { create } from 'zustand';

export interface AppState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  globalLoading: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  globalLoading: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
