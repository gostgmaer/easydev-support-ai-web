import { create } from 'zustand';
import { Conversation, ConversationStatus, ConversationPriority } from '../types';

export interface InboxFilters {
  status?: ConversationStatus[];
  priority?: ConversationPriority[];
  tags?: string[];
  assignedAgentId?: string | null;
}

interface InboxState {
  selectedView: 'my' | 'team' | 'unassigned' | 'escalated' | 'bookmarks' | 'snoozed';
  filters: InboxFilters;
  selectedConversationIds: string[];
  activeConversationId: string | null;
  conversations: Conversation[];
  setSelectedView: (view: 'my' | 'team' | 'unassigned' | 'escalated' | 'bookmarks' | 'snoozed') => void;
  setFilters: (filters: InboxFilters) => void;
  updateFilters: (updates: Partial<InboxFilters>) => void;
  toggleSelectConversation: (id: string) => void;
  setSelectedConversationIds: (ids: string[]) => void;
  clearSelection: () => void;
  setActiveConversationId: (id: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
}

export const useInboxStore = create<InboxState>((set) => ({
  selectedView: 'my',
  filters: {},
  selectedConversationIds: [],
  activeConversationId: null,
  conversations: [],
  setSelectedView: (view) => set({ selectedView: view, selectedConversationIds: [] }),
  setFilters: (filters) => set({ filters }),
  updateFilters: (updates) => set((state) => ({ filters: { ...state.filters, ...updates } })),
  toggleSelectConversation: (id) =>
    set((state) => {
      const selected = state.selectedConversationIds.includes(id)
        ? state.selectedConversationIds.filter((cid) => cid !== id)
        : [...state.selectedConversationIds, id];
      return { selectedConversationIds: selected };
    }),
  setSelectedConversationIds: (ids) => set({ selectedConversationIds: ids }),
  clearSelection: () => set({ selectedConversationIds: [] }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setConversations: (conversations) => set({ conversations }),
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
}));
