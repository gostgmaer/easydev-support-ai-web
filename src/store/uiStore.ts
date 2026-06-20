import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  activeConversationId: string | null;
  toggleSidebar: () => void;
  setActiveConversationId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  activeConversationId: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
}));

interface AuthState {
  tenantId: string | null;
  agentId: string | null;
  setAuth: (tenantId: string, agentId: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  tenantId: null, // Will be set post-login via EasyDev IAM
  agentId: null,
  setAuth: (tenantId, agentId) => set({ tenantId, agentId }),
}));
