import { create } from 'zustand';
import { HelpArticleSummary } from './searchStore';

export interface HelpCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  articleCount: number;
}

export interface HelpCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  articleCount: number;
}

interface KnowledgeState {
  categories: HelpCategory[];
  collections: HelpCollection[];
  featuredArticles: HelpArticleSummary[];
  popularArticles: HelpArticleSummary[];
  trendingArticles: HelpArticleSummary[];

  setCategories: (categories: HelpCategory[]) => void;
  setCollections: (collections: HelpCollection[]) => void;
  setFeaturedArticles: (articles: HelpArticleSummary[]) => void;
  setPopularArticles: (articles: HelpArticleSummary[]) => void;
  setTrendingArticles: (articles: HelpArticleSummary[]) => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  categories: [],
  collections: [],
  featuredArticles: [],
  popularArticles: [],
  trendingArticles: [],

  setCategories: (categories) => set({ categories }),
  setCollections: (collections) => set({ collections }),
  setFeaturedArticles: (featuredArticles) => set({ featuredArticles }),
  setPopularArticles: (popularArticles) => set({ popularArticles }),
  setTrendingArticles: (trendingArticles) => set({ trendingArticles }),
}));
