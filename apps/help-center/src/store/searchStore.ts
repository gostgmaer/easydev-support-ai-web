import { create } from 'zustand';

export interface HelpArticleSummary {
  id: string;
  title: string;
  slug: string;
  categoryId?: string;
  categoryName?: string;
  updatedAt: string;
  tags?: string[];
}

interface SearchState {
  searchResults: HelpArticleSummary[];
  recentSearches: string[];
  popularSearches: string[];
  isSearching: boolean;

  setSearchResults: (results: HelpArticleSummary[]) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setSearching: (searching: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchResults: [],
  recentSearches: [],
  popularSearches: ['refund policy', 'track package', 'cancel subscription', 'change email'],
  isSearching: false,

  setSearchResults: (searchResults) => set({ searchResults }),
  addRecentSearch: (query) => set((state) => {
    if (!query.trim()) return {};
    const filtered = state.recentSearches.filter(q => q !== query);
    return { recentSearches: [query, ...filtered].slice(0, 5) };
  }),
  clearRecentSearches: () => set({ recentSearches: [] }),
  setSearching: (isSearching) => set({ isSearching }),
}));
