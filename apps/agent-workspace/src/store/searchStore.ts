import { create } from 'zustand';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  category: 'conversations' | 'tickets' | 'customers' | 'knowledge' | 'all';
}

interface SearchState {
  query: string;
  category: 'conversations' | 'tickets' | 'customers' | 'knowledge' | 'all';
  recentSearches: string[];
  savedSearches: SavedSearch[];
  setQuery: (query: string) => void;
  setCategory: (category: 'conversations' | 'tickets' | 'customers' | 'knowledge' | 'all') => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  addSavedSearch: (name: string, query: string, category: SearchState['category']) => void;
  removeSavedSearch: (id: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  category: 'all',
  recentSearches: [],
  savedSearches: [],
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  addRecentSearch: (query) =>
    set((state) => {
      if (!query.trim()) return {};
      const filtered = state.recentSearches.filter((q) => q !== query);
      const updated = [query, ...filtered].slice(0, 10);
      return { recentSearches: updated };
    }),
  clearRecentSearches: () => set({ recentSearches: [] }),
  addSavedSearch: (name, query, category) =>
    set((state) => {
      const newSearch: SavedSearch = {
        id: Math.random().toString(36).substring(7),
        name,
        query,
        category,
      };
      return { savedSearches: [...state.savedSearches, newSearch] };
    }),
  removeSavedSearch: (id) =>
    set((state) => ({
      savedSearches: state.savedSearches.filter((s) => s.id !== id),
    })),
}));
