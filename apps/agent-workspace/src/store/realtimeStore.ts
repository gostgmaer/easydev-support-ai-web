import { create } from 'zustand';
import { PresenceUser } from '../types';

interface RealtimeState {
  connected: boolean;
  agentPresence: Record<string, PresenceUser>;
  setConnected: (connected: boolean) => void;
  updatePresence: (agentId: string, presence: PresenceUser) => void;
  setPresenceList: (presenceList: Record<string, PresenceUser>) => void;
  removePresence: (agentId: string) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  agentPresence: {},
  setConnected: (connected) => set({ connected }),
  updatePresence: (agentId, presence) =>
    set((state) => ({
      agentPresence: { ...state.agentPresence, [agentId]: presence },
    })),
  setPresenceList: (presenceList) => set({ agentPresence: presenceList }),
  removePresence: (agentId) =>
    set((state) => {
      const updated = { ...state.agentPresence };
      delete updated[agentId];
      return { agentPresence: updated };
    }),
}));
