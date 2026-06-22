import { create } from "zustand";
import type { ConnectionStatus } from "@easydev/types";

export type AgentStatus = "online" | "busy" | "offline";

export interface PresenceUser {
  id: string;
  name: string;
  avatar: string;
  status: AgentStatus;
  role: "agent" | "manager" | "admin";
}

interface RealtimeState {
  connected: boolean;
  connectionStatus: ConnectionStatus;
  agentPresence: Record<string, PresenceUser>;
  setConnected: (connected: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  updatePresence: (agentId: string, presence: PresenceUser) => void;
  setPresenceList: (presenceList: Record<string, PresenceUser>) => void;
  removePresence: (agentId: string) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  connectionStatus: "DISCONNECTED",
  agentPresence: {},
  setConnected: (connected) => set({ connected }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  updatePresence: (agentId, presence) =>
    set((state) => ({ agentPresence: { ...state.agentPresence, [agentId]: presence } })),
  setPresenceList: (presenceList) => set({ agentPresence: presenceList }),
  removePresence: (agentId) =>
    set((state) => {
      const updated = { ...state.agentPresence };
      delete updated[agentId];
      return { agentPresence: updated };
    }),
}));
