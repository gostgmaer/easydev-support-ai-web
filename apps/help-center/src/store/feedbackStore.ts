import { create } from 'zustand';

interface FeedbackState {
  // Map of articleId to 'helpful' | 'not-helpful' to prevent double submissions in-session
  ratedArticles: Record<string, 'helpful' | 'not-helpful'>;
  generalRatingsSubmitted: boolean;

  rateArticle: (articleId: string, value: 'helpful' | 'not-helpful') => void;
  setGeneralRatingsSubmitted: (submitted: boolean) => void;
  clearFeedback: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  ratedArticles: {},
  generalRatingsSubmitted: false,

  rateArticle: (articleId, value) =>
    set((state) => ({
      ratedArticles: { ...state.ratedArticles, [articleId]: value },
    })),
  setGeneralRatingsSubmitted: (generalRatingsSubmitted) => set({ generalRatingsSubmitted }),
  clearFeedback: () => set({ ratedArticles: {}, generalRatingsSubmitted: false }),
}));
