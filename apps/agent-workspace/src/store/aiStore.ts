import { create } from 'zustand';
import { AiDraft, AiEscalation, AiSessionState } from '../types';

interface AiState {
  drafts: Record<string, AiDraft | null>;
  sessions: Record<string, AiSessionState>;
  escalations: AiEscalation[];
  setDraft: (conversationId: string, draft: AiDraft | null) => void;
  setSession: (conversationId: string, session: AiSessionState) => void;
  setEscalations: (escalations: AiEscalation[]) => void;
  addEscalation: (escalation: AiEscalation) => void;
  resolveEscalation: (id: string) => void;
}

export const useAiStore = create<AiState>((set) => ({
  drafts: {},
  sessions: {},
  escalations: [],
  setDraft: (conversationId, draft) =>
    set((state) => ({
      drafts: { ...state.drafts, [conversationId]: draft },
    })),
  setSession: (conversationId, session) =>
    set((state) => ({
      sessions: { ...state.sessions, [conversationId]: session },
    })),
  setEscalations: (escalations) => set({ escalations }),
  addEscalation: (escalation) =>
    set((state) => {
      if (state.escalations.some((e) => e.id === escalation.id)) return {};
      return { escalations: [escalation, ...state.escalations] };
    }),
  resolveEscalation: (id) =>
    set((state) => ({
      escalations: state.escalations.map((e) => (e.id === id ? { ...e, status: 'resolved' } : e)),
    })),
}));
