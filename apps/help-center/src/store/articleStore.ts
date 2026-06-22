import { create } from 'zustand';
import { HelpArticleSummary } from './searchStore';

export interface DetailedArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryId?: string;
  categoryName?: string;
  updatedAt: string;
  tags?: string[];
  readingTimeMin: number;
}

interface ArticleState {
  currentArticle: DetailedArticle | null;
  relatedArticles: HelpArticleSummary[];

  setCurrentArticle: (article: DetailedArticle | null) => void;
  setRelatedArticles: (articles: HelpArticleSummary[]) => void;
}

export const useArticleStore = create<ArticleState>((set) => ({
  currentArticle: null,
  relatedArticles: [],

  setCurrentArticle: (currentArticle) => set({ currentArticle }),
  setRelatedArticles: (relatedArticles) => set({ relatedArticles }),
}));
