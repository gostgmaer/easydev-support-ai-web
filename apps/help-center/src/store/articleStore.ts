import { create } from 'zustand';
import { HelpArticleSummary } from './searchStore';

export interface Author {
  name: string;
  avatarUrl?: string;
  role: string;
}

export interface VersionInfo {
  version: string;
  updatedAt: string;
  authorName: string;
  changeSummary?: string;
}

export interface DetailedArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryName?: string;
  categoryId?: string;
  collectionName?: string;
  collectionId?: string;
  updatedAt: string;
  author: Author;
  readingTimeMin: number;
  versions: VersionInfo[];
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
}

interface ArticleState {
  currentArticle: DetailedArticle | null;
  relatedArticles: HelpArticleSummary[];
  suggestedArticles: HelpArticleSummary[];

  setCurrentArticle: (article: DetailedArticle | null) => void;
  setRelatedArticles: (articles: HelpArticleSummary[]) => void;
  setSuggestedArticles: (articles: HelpArticleSummary[]) => void;
}

export const useArticleStore = create<ArticleState>((set) => ({
  currentArticle: null,
  relatedArticles: [],
  suggestedArticles: [],

  setCurrentArticle: (currentArticle) => set({ currentArticle }),
  setRelatedArticles: (relatedArticles) => set({ relatedArticles }),
  setSuggestedArticles: (suggestedArticles) => set({ suggestedArticles }),
}));
