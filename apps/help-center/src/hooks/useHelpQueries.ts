import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchStore, HelpArticleSummary } from '../store/searchStore';
import { useKnowledgeStore, HelpCategory, HelpCollection } from '../store/knowledgeStore';
import { useArticleStore, DetailedArticle } from '../store/articleStore';
import { useTicketStore, HelpTicketSummary } from '../store/ticketStore';
import { useAIHelpStore, AIMessage } from '../store/aiHelpStore';

const helpRequest = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333/api';
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Help Center API Error: ${response.statusText}`);
  }
  return response.json();
};

// 1. KNOWLEDGE BASE NAVIGATION
export function useCategories() {
  const setCategories = useKnowledgeStore((state) => state.setCategories);
  return useQuery<HelpCategory[]>({
    queryKey: ['help', 'categories'],
    queryFn: async () => {
      const data = await helpRequest<HelpCategory[]>('/help/categories');
      setCategories(data);
      return data;
    },
  });
}

export function useCollections(categoryId?: string) {
  const setCollections = useKnowledgeStore((state) => state.setCollections);
  return useQuery<HelpCollection[]>({
    queryKey: ['help', 'collections', categoryId],
    queryFn: async () => {
      const path = categoryId ? `/help/collections?categoryId=${categoryId}` : '/help/collections';
      const data = await helpRequest<HelpCollection[]>(path);
      setCollections(data);
      return data;
    },
  });
}

export function useCategoryArticles(categorySlug: string) {
  return useQuery<HelpArticleSummary[]>({
    queryKey: ['help', 'categories', categorySlug, 'articles'],
    queryFn: async () => {
      return helpRequest<HelpArticleSummary[]>(`/help/categories/${categorySlug}/articles`);
    },
    enabled: !!categorySlug,
  });
}

export function useCollectionArticles(collectionSlug: string) {
  return useQuery<HelpArticleSummary[]>({
    queryKey: ['help', 'collections', collectionSlug, 'articles'],
    queryFn: async () => {
      return helpRequest<HelpArticleSummary[]>(`/help/collections/${collectionSlug}/articles`);
    },
    enabled: !!collectionSlug,
  });
}

// 2. ARTICLE VIEWER
export function useArticle(slug: string) {
  const setCurrentArticle = useArticleStore((state) => state.setCurrentArticle);
  return useQuery<DetailedArticle>({
    queryKey: ['help', 'articles', slug],
    queryFn: async () => {
      const data = await helpRequest<DetailedArticle>(`/help/articles/${slug}`);
      setCurrentArticle(data);
      return data;
    },
    enabled: !!slug,
  });
}

export function useRelatedArticles(slug: string) {
  const setRelatedArticles = useArticleStore((state) => state.setRelatedArticles);
  return useQuery<HelpArticleSummary[]>({
    queryKey: ['help', 'articles', slug, 'related'],
    queryFn: async () => {
      const data = await helpRequest<HelpArticleSummary[]>(`/help/articles/${slug}/related`);
      setRelatedArticles(data);
      return data;
    },
    enabled: !!slug,
  });
}

// 3. GLOBAL KNOWLEDGE SEARCH
export function useArticleSearch(query: string, category?: string) {
  const setSearchResults = useSearchStore((state) => state.setSearchResults);
  const setSearching = useSearchStore((state) => state.setSearching);

  return useQuery<HelpArticleSummary[]>({
    queryKey: ['help', 'search', query, category],
    queryFn: async () => {
      if (!query.trim()) return [];
      setSearching(true);
      try {
        const catQuery = category ? `&category=${encodeURIComponent(category)}` : '';
        const data = await helpRequest<HelpArticleSummary[]>(`/help/search?query=${encodeURIComponent(query)}${catQuery}`);
        setSearchResults(data);
        return data;
      } finally {
        setSearching(false);
      }
    },
    enabled: query.length > 1,
  });
}

// 4. ARTICLE FEEDBACK & RATINGS
export function useSubmitArticleFeedback() {
  return useMutation({
    mutationFn: async (variables: { articleId: string; value: 'helpful' | 'not-helpful'; comment?: string }) => {
      return helpRequest<{ success: boolean }>(`/help/articles/${variables.articleId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ value: variables.value, comment: variables.comment }),
      });
    },
  });
}

// 5. TICKET SUBMISSION WITH AUTO DEFLECTION
export function useTicketDeflectionSuggestions() {
  const setDeflectionArticles = useTicketStore((state) => state.setDeflectionArticles);
  const setDeflecting = useTicketStore((state) => state.setDeflecting);

  return useMutation({
    mutationFn: async (subject: string) => {
      setDeflecting(true);
      try {
        const data = await helpRequest<HelpArticleSummary[]>(`/help/tickets/deflect?subject=${encodeURIComponent(subject)}`);
        setDeflectionArticles(data);
        return data;
      } finally {
        setDeflecting(false);
      }
    },
  });
}

export function useSubmitHelpTicket() {
  const queryClient = useQueryClient();
  const addTicketToHistory = useTicketStore((state) => state.addTicketToHistory);

  return useMutation({
    mutationFn: async (variables: {
      subject: string;
      description: string;
      category: string;
      priority: string;
      email: string;
      attachments?: { name: string; url: string; size: number }[];
    }) => {
      return helpRequest<HelpTicketSummary>('/help/tickets', {
        method: 'POST',
        body: JSON.stringify(variables),
      });
    },
    onSuccess: (data) => {
      addTicketToHistory(data);
      queryClient.invalidateQueries({ queryKey: ['help', 'tickets'] });
    },
  });
}

// 6. ASK AI CHAT ASSISTANT
export function useAskAIAssistant() {
  const addAIMessage = useAIHelpStore((state) => state.addAIMessage);
  const setAskingAI = useAIHelpStore((state) => state.setAskingAI);

  return useMutation({
    mutationFn: async (messageContent: string) => {
      setAskingAI(true);
      try {
        return await helpRequest<{
          content: string;
          confidenceScore: number;
          recommendedArticles?: HelpArticleSummary[];
        }>('/help/ai/ask', {
          method: 'POST',
          body: JSON.stringify({ message: messageContent }),
        });
      } finally {
        setAskingAI(false);
      }
    },
    onSuccess: (data, messageContent) => {
      // Add user message
      addAIMessage({
        id: `usr-${Date.now()}`,
        sender: 'user',
        content: messageContent,
        createdAt: new Date().toISOString(),
      });
      // Add assistant response
      addAIMessage({
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: data.content,
        confidenceScore: data.confidenceScore,
        recommendedArticles: data.recommendedArticles,
        createdAt: new Date().toISOString(),
      });
    },
  });
}

// 7. STATUS & RELEASES
export interface SystemStatus {
  overallStatus: 'operational' | 'degraded' | 'maintenance' | 'outage';
  incidentHistory: { id: string; title: string; status: string; date: string; updates: string[] }[];
  maintenance: { id: string; title: string; scheduledFor: string; duration: string }[];
  metrics: { name: string; uptime: number }[];
}

export function useSystemStatus() {
  return useQuery<SystemStatus>({
    queryKey: ['help', 'system-status'],
    queryFn: async () => {
      return helpRequest<SystemStatus>('/help/status');
    },
  });
}

export interface ReleaseNote {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  updates: { type: 'feature' | 'bugfix' | 'announcement'; content: string }[];
}

export function useReleaseNotes() {
  return useQuery<ReleaseNote[]>({
    queryKey: ['help', 'release-notes'],
    queryFn: async () => {
      return helpRequest<ReleaseNote[]>('/help/release-notes');
    },
  });
}
