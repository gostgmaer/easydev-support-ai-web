import { create } from 'zustand';

export interface PresenceState {
  agentId: string;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
  lastSeen?: string;
}

interface RealtimeStore {
  isConnected: boolean;
  presenceList: Record<string, PresenceState>;
  typingStates: Record<string, boolean>; // Maps conversationId -> boolean
  setConnected: (connected: boolean) => void;
  updatePresence: (agentId: string, presence: PresenceState) => void;
  setTyping: (conversationId: string, typing: boolean) => void;
  clearTyping: (conversationId: string) => void;
}

export const useRealtimeStore = create<RealtimeStore>((set) => ({
  isConnected: false,
  presenceList: {},
  typingStates: {},
  setConnected: (connected) => set({ isConnected: connected }),
  updatePresence: (agentId, presence) =>
    set((state) => ({
      presenceList: { ...state.presenceList, [agentId]: presence }
    })),
  setTyping: (conversationId, typing) =>
    set((state) => ({
      typingStates: { ...state.typingStates, [conversationId]: typing }
    })),
  clearTyping: (conversationId) =>
    set((state) => {
      const copy = { ...state.typingStates };
      delete copy[conversationId];
      return { typingStates: copy };
    })
}));
