import { create } from 'zustand';
import { Conversation, ConversationStatus, ConversationPriority } from '../types';

export interface InboxFilters {
  status?: ConversationStatus[];
  priority?: ConversationPriority[];
  tags?: string[];
  assignedAgentId?: string | null;
}

export interface SavedInboxView {
  id: string;
  name: string;
  filters: InboxFilters;
}

export type InboxView = 'my' | 'team' | 'unassigned' | 'escalated' | 'bookmarks' | 'snoozed';

interface InboxState {
  selectedView: InboxView;
  filters: InboxFilters;
  activeSavedViewId: string | null;
  selectedConversationIds: string[];
  activeConversationId: string | null;
  conversations: Conversation[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  savedViews: SavedInboxView[];
  bookmarkedIds: Set<string>;
  setSelectedView: (view: InboxView) => void;
  setActiveSavedView: (id: string, filters: InboxFilters) => void;
  setFilters: (filters: InboxFilters) => void;
  updateFilters: (updates: Partial<InboxFilters>) => void;
  toggleSelectConversation: (id: string) => void;
  setSelectedConversationIds: (ids: string[]) => void;
  clearSelection: () => void;
  setActiveConversationId: (id: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  appendConversations: (conversations: Conversation[]) => void;
  setPagination: (pagination: { nextCursor: string | null; hasMore: boolean }) => void;
  setLoadingMore: (loading: boolean) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  addSavedView: (name: string, filters: InboxFilters) => void;
  removeSavedView: (id: string) => void;
  setBookmarkedIds: (ids: Set<string>) => void;
}

export const useInboxStore = create<InboxState>((set) => ({
  selectedView: 'my',
  filters: {},
  activeSavedViewId: null,
  selectedConversationIds: [],
  activeConversationId: null,
  conversations: [],
  nextCursor: null,
  hasMore: false,
  isLoadingMore: false,
  savedViews: [],
  bookmarkedIds: new Set(),
  setSelectedView: (view) => set({ selectedView: view, activeSavedViewId: null, filters: {}, selectedConversationIds: [] }),
  setActiveSavedView: (id, filters) => set({ activeSavedViewId: id, filters, selectedView: 'my', selectedConversationIds: [] }),
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
  appendConversations: (conversations) =>
    set((state) => {
      const existingIds = new Set(state.conversations.map((c) => c.id));
      const merged = [...state.conversations, ...conversations.filter((c) => !existingIds.has(c.id))];
      return { conversations: merged };
    }),
  setPagination: ({ nextCursor, hasMore }) => set({ nextCursor, hasMore }),
  setLoadingMore: (loading) => set({ isLoadingMore: loading }),
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  addSavedView: (name, filters) =>
    set((state) => ({
      savedViews: [...state.savedViews, { id: `view-${Date.now()}`, name, filters }],
    })),
  removeSavedView: (id) =>
    set((state) => ({ savedViews: state.savedViews.filter((v) => v.id !== id) })),
  setBookmarkedIds: (bookmarkedIds) => set({ bookmarkedIds }),
}));
