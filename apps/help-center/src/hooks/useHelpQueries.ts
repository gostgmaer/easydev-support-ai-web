import { useQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from '@easydev/api-client';
import { useAnalytics } from '@easydev/analytics';
import { useSearchStore, HelpArticleSummary } from '../store/searchStore';
import { useKnowledgeStore, HelpCategory } from '../store/knowledgeStore';
import { useArticleStore, DetailedArticle } from '../store/articleStore';
import { useTicketStore, HelpTicketSummary } from '../store/ticketStore';
import { useAIHelpStore } from '../store/aiHelpStore';

// Raw shapes returned by the backend's public knowledge/ticket endpoints
// (src/modules/public-help on the backend) - these mirror the real
// KnowledgeCategory/KnowledgeDocument/Ticket aggregates' toJSON() output.
interface RawCategory {
  id: string;
  name: string;
  description: string | null;
  parentCategoryId: string | null;
  sortOrder: number;
}

interface RawDocument {
  id: string;
  categoryId: string | null;
  title: string;
  slug: string;
  documentType: string;
  status: string;
  tags: string[] | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  content?: string;
}

interface RawSearchResult {
  document: RawDocument;
  score: number;
}

interface RawTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: string;
  status: string;
  createdAt: string;
}

function toCategory(raw: RawCategory): HelpCategory {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    parentCategoryId: raw.parentCategoryId,
    sortOrder: raw.sortOrder,
  };
}

function toSummary(raw: RawDocument, categories: HelpCategory[]): HelpArticleSummary {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    categoryId: raw.categoryId ?? undefined,
    categoryName: categories.find((c) => c.id === raw.categoryId)?.name,
    updatedAt: raw.updatedAt,
    tags: raw.tags ?? undefined,
  };
}

function computeReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// 1. KNOWLEDGE BASE NAVIGATION
export function useCategories() {
  const apiClient = useApiClient();
  const setCategories = useKnowledgeStore((state) => state.setCategories);
  return useQuery<HelpCategory[]>({
    queryKey: ['help', 'categories'],
    queryFn: async () => {
      const raw = await apiClient.get<RawCategory[]>('/v1/public/knowledge/categories');
      const categories = raw.map(toCategory);
      setCategories(categories);
      return categories;
    },
  });
}

export function useCategoryArticles(categoryId: string) {
  const apiClient = useApiClient();
  const categories = useKnowledgeStore((state) => state.categories);
  return useQuery<HelpArticleSummary[]>({
    queryKey: ['help', 'categories', categoryId, 'articles'],
    queryFn: async () => {
      const raw = await apiClient.get<RawDocument[]>('/v1/public/knowledge/documents', {
        query: { categoryId },
      });
      return raw.map((d) => toSummary(d, categories));
    },
    enabled: !!categoryId,
  });
}

// Real backend has no "featured/popular/trending" curation flag - this is
// the most recently updated published articles, an honest stand-in.
export function useRecentArticles(limit = 5) {
  const apiClient = useApiClient();
  const categories = useKnowledgeStore((state) => state.categories);
  return useQuery<HelpArticleSummary[]>({
    queryKey: ['help', 'documents', 'recent'],
    queryFn: async () => {
      const raw = await apiClient.get<RawDocument[]>('/v1/public/knowledge/documents');
      return raw
        .map((d) => toSummary(d, categories))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);
    },
  });
}

// FAQ is a real documentType in the backend (DocumentTypeEnum.FAQ) - each
// FAQ document's title is the question and its content is the answer.
export function useFaqArticles() {
  const apiClient = useApiClient();
  const categories = useKnowledgeStore((state) => state.categories);
  return useQuery<HelpArticleSummary[]>({
    queryKey: ['help', 'documents', 'faq'],
    queryFn: async () => {
      const raw = await apiClient.get<RawDocument[]>('/v1/public/knowledge/documents', {
        query: { documentType: 'FAQ' },
      });
      return raw.map((d) => toSummary(d, categories));
    },
  });
}

// 2. ARTICLE VIEWER
export function useArticle(slug: string) {
  const apiClient = useApiClient();
  const setCurrentArticle = useArticleStore((state) => state.setCurrentArticle);
  const categories = useKnowledgeStore((state) => state.categories);
  return useQuery<DetailedArticle>({
    queryKey: ['help', 'articles', slug],
    queryFn: async () => {
      const raw = await apiClient.get<RawDocument & { content: string }>(
        `/v1/public/knowledge/documents/${slug}`,
      );
      const article: DetailedArticle = {
        id: raw.id,
        title: raw.title,
        slug: raw.slug,
        content: raw.content,
        categoryId: raw.categoryId ?? undefined,
        categoryName: categories.find((c) => c.id === raw.categoryId)?.name,
        updatedAt: raw.updatedAt,
        tags: raw.tags ?? undefined,
        readingTimeMin: computeReadingTime(raw.content),
      };
      setCurrentArticle(article);
      return article;
    },
    enabled: !!slug,
  });
}

// No "related articles" concept exists in the backend - other published
// articles in the same category is an honest, real substitute.
export function useRelatedArticles(slug: string, categoryId?: string) {
  const apiClient = useApiClient();
  const setRelatedArticles = useArticleStore((state) => state.setRelatedArticles);
  const categories = useKnowledgeStore((state) => state.categories);
  return useQuery<HelpArticleSummary[]>({
    queryKey: ['help', 'articles', slug, 'related', categoryId],
    queryFn: async () => {
      if (!categoryId) {
        setRelatedArticles([]);
        return [];
      }
      const raw = await apiClient.get<RawDocument[]>('/v1/public/knowledge/documents', {
        query: { categoryId },
      });
      const related = raw
        .filter((d) => d.slug !== slug)
        .map((d) => toSummary(d, categories))
        .slice(0, 5);
      setRelatedArticles(related);
      return related;
    },
    enabled: !!categoryId,
  });
}

// 3. GLOBAL KNOWLEDGE SEARCH
export function useArticleSearch(query: string, categoryId?: string) {
  const apiClient = useApiClient();
  const analytics = useAnalytics();
  const setSearchResults = useSearchStore((state) => state.setSearchResults);
  const setSearching = useSearchStore((state) => state.setSearching);
  const categories = useKnowledgeStore((state) => state.categories);

  return useQuery<HelpArticleSummary[]>({
    queryKey: ['help', 'search', query, categoryId],
    queryFn: async () => {
      if (!query.trim()) return [];
      setSearching(true);
      try {
        const raw = await apiClient.post<RawSearchResult[]>('/v1/public/knowledge/search', {
          query,
          categoryId,
        });
        const results = raw.map((r) => toSummary(r.document, categories));
        setSearchResults(results);
        analytics.trackEvent('help_search', { query, categoryId, resultsCount: results.length });
        return results;
      } finally {
        setSearching(false);
      }
    },
    enabled: query.length > 1,
  });
}

// 4. TICKET SUBMISSION WITH AUTO DEFLECTION
export function useTicketDeflectionSuggestions() {
  const apiClient = useApiClient();
  const setDeflectionArticles = useTicketStore((state) => state.setDeflectionArticles);
  const setDeflecting = useTicketStore((state) => state.setDeflecting);
  const categories = useKnowledgeStore((state) => state.categories);

  return useMutation({
    mutationFn: async (subject: string) => {
      setDeflecting(true);
      try {
        const raw = await apiClient.post<RawSearchResult[]>('/v1/public/knowledge/search', {
          query: subject,
        });
        const results = raw.slice(0, 3).map((r) => toSummary(r.document, categories));
        setDeflectionArticles(results);
        return results;
      } finally {
        setDeflecting(false);
      }
    },
  });
}

const TICKET_PRIORITY_MAP: Record<string, string> = {
  low: 'LOW',
  normal: 'MEDIUM',
  high: 'HIGH',
  urgent: 'URGENT',
};

const TICKET_CATEGORY_LABELS: Record<string, string> = {
  billing: 'Billing & Invoices',
  shipping: 'Order Shipping',
  returns: 'Refunds & Returns',
  technical: 'Technical Bug',
};

export function useSubmitHelpTicket() {
  const apiClient = useApiClient();
  const analytics = useAnalytics();
  const addTicketToHistory = useTicketStore((state) => state.addTicketToHistory);

  return useMutation({
    mutationFn: async (variables: {
      subject: string;
      description: string;
      category: string;
      priority: string;
      email: string;
      name?: string;
    }) => {
      const categoryLabel = TICKET_CATEGORY_LABELS[variables.category] ?? variables.category;
      return apiClient.post<RawTicket>('/v1/public/tickets', {
        subject: variables.subject,
        description: variables.description,
        email: variables.email,
        name: variables.name,
        priority: TICKET_PRIORITY_MAP[variables.priority] ?? 'MEDIUM',
        category: categoryLabel,
      });
    },
    onSuccess: (data, variables) => {
      addTicketToHistory({
        id: data.id,
        ticketNumber: data.ticketNumber,
        subject: data.subject,
        priority: data.priority,
        status: data.status,
        createdAt: data.createdAt,
      });
      analytics.trackEvent('help_ticket_submitted', { category: variables.category, priority: data.priority });
    },
  });
}

// 5. AI ASSISTANCE (FLOW 5)
export interface AiAssistSource {
  id: string;
  title: string;
  slug: string;
  score: number;
}

export interface AiAssistResult {
  sessionId: string;
  answer: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  sources: AiAssistSource[];
  suggestEscalation: boolean;
  escalationPrompt: string | null;
}

export function useAskHelpAI() {
  const apiClient = useApiClient();
  const analytics = useAnalytics();
  const addAIMessage = useAIHelpStore((state) => state.addAIMessage);
  const setAskingAI = useAIHelpStore((state) => state.setAskingAI);
  const setEscalationTriggered = useAIHelpStore((state) => state.setEscalationTriggered);

  return useMutation({
    mutationFn: async (variables: { query: string; sessionId?: string; categoryId?: string }) => {
      return apiClient.post<AiAssistResult>('/v1/public/ai-assist/query', variables);
    },
    onMutate: (variables) => {
      setAskingAI(true);
      addAIMessage({
        id: `user-${Date.now()}`,
        sender: 'user',
        content: variables.query,
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: (data) => {
      addAIMessage({
        id: `${data.sessionId}-${Date.now()}`,
        sender: 'assistant',
        content: data.answer || data.escalationPrompt || "I couldn't find an answer to that.",
        confidenceScore: data.confidence === 'HIGH' ? 1 : data.confidence === 'MEDIUM' ? 0.6 : 0.3,
        createdAt: new Date().toISOString(),
      });
      if (data.suggestEscalation) setEscalationTriggered(true);
      analytics.trackFeatureUsage('help-ai-assist', { confidence: data.confidence, suggestEscalation: data.suggestEscalation });
    },
    onSettled: () => setAskingAI(false),
  });
}

export function useSubmitAiDeflectionFeedback() {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: (variables: { sessionId: string; resolved: boolean; documentId?: string; email?: string }) =>
      apiClient.post<{ deflected: boolean; ticketId?: string; message: string }>(
        '/v1/public/ai-assist/deflection-feedback',
        variables,
      ),
  });
}
