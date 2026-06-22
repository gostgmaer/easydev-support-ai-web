import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@easydev/api-client';
import { KnowledgeArticle } from '../types';

/** Knowledge search is a POST with a body (not a GET querystring) on the real backend. */
export function useKnowledgeSearch(query: string) {
  const api = useApiClient();
  return useQuery<KnowledgeArticle[]>({
    queryKey: ['knowledge', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      return api.post<KnowledgeArticle[]>('/v1/knowledge-search', { query });
    },
    enabled: query.length > 1,
  });
}
