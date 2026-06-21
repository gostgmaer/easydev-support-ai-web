import { create } from 'zustand';

export interface HelpArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryName?: string;
  collectionName?: string;
  updatedAt: string;
}

export interface SearchFilters {
  category?: string;
  collection?: string;
  dateRange?: 'all' | 'day' | 'week' | 'month';
}

interface SearchState {
  searchQuery: string;
  searchResults: HelpArticleSummary[];
  recentSearches: string[];
  popularSearches: string[];
  filters: SearchFilters;
  isSearching: boolean;

  setSearchQuery: (query: string) => void;
  setSearchResults: (results: HelpArticleSummary[]) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  setSearching: (searching: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  searchResults: [],
  recentSearches: [],
  popularSearches: ['refund policy', 'track package', 'cancel subscription', 'change email'],
  filters: {},
  isSearching: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  addRecentSearch: (query) => set((state) => {
    if (!query.trim()) return {};
    const filtered = state.recentSearches.filter(q => q !== query);
    return { recentSearches: [query, ...filtered].slice(0, 5) };
  }),
  clearRecentSearches: () => set({ recentSearches: [] }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  clearFilters: () => set({ filters: {} }),
  setSearching: (isSearching) => set({ isSearching }),
}));
