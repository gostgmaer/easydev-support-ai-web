import { create } from 'zustand';
import type { ConnectionStatus, PresenceStatus, TypingPayload } from '@easydev/types';

export interface RealtimeState {
  connectionStatus: ConnectionStatus;
  lastConnectedAt: number | null;
  presence: Record<string, PresenceStatus>;
  typing: Record<string, TypingPayload[]>;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setPresence: (userId: string, status: PresenceStatus) => void;
  setTyping: (conversationId: string, payload: TypingPayload) => void;
  clearTyping: (conversationId: string, userId: string) => void;
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  connectionStatus: 'DISCONNECTED',
  lastConnectedAt: null,
  presence: {},
  typing: {},
  setConnectionStatus: (status) =>
    set({
      connectionStatus: status,
      lastConnectedAt: status === 'CONNECTED' ? Date.now() : get().lastConnectedAt,
    }),
  setPresence: (userId, status) => set({ presence: { ...get().presence, [userId]: status } }),
  setTyping: (conversationId, payload) => {
    const current = get().typing[conversationId] ?? [];
    const next = current.filter((entry) => entry.userId !== payload.userId);
    if (payload.isTyping) next.push(payload);
    set({ typing: { ...get().typing, [conversationId]: next } });
  },
  clearTyping: (conversationId, userId) => {
    const current = get().typing[conversationId] ?? [];
    set({
      typing: { ...get().typing, [conversationId]: current.filter((entry) => entry.userId !== userId) },
    });
  },
}));
