import { create } from 'zustand';
import type { ActiveSession } from '@easydev/types';

export interface SessionState {
  activeSessions: ActiveSession[];
  lastActivityAt: number | null;
  setActiveSessions: (sessions: ActiveSession[]) => void;
  removeSession: (sessionId: string) => void;
  touchActivity: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessions: [],
  lastActivityAt: null,
  setActiveSessions: (sessions) => set({ activeSessions: sessions }),
  removeSession: (sessionId) =>
    set((state) => ({ activeSessions: state.activeSessions.filter((session) => session.id !== sessionId) })),
  touchActivity: () => set({ lastActivityAt: Date.now() }),
  reset: () => set({ activeSessions: [], lastActivityAt: null }),
}));
