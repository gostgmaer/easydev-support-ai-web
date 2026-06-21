import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@easydev/api-client';
import { useAiStore } from '../store/aiStore';
import { AiEscalation, AiSessionState } from '../types';

export function useAiSession(conversationId: string | null) {
  const api = useApiClient();
  const setSession = useAiStore((state) => state.setSession);

  const query = useQuery<AiSessionState>({
    queryKey: ['ai-session', conversationId],
    queryFn: async () => {
      if (!conversationId) throw new Error('Conversation ID is required');
      return api.get<AiSessionState>(`/v1/ai-sessions/conversation/${conversationId}`);
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (query.data && conversationId) setSession(conversationId, query.data);
  }, [query.data, conversationId, setSession]);

  return query;
}

export function useUpdateAiStatus() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const setSession = useAiStore((state) => state.setSession);

  return useMutation({
    mutationFn: async ({
      conversationId,
      status,
    }: {
      conversationId: string;
      status: 'active' | 'paused' | 'takeover';
    }) => {
      return api.put<AiSessionState>(`/v1/ai-sessions/conversation/${conversationId}/state`, { status });
    },
    onSuccess: (session, { conversationId }) => setSession(conversationId, session),
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-session', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });
}

export function useAiEscalations(status: 'pending' | 'resolved' = 'pending') {
  const api = useApiClient();
  const setEscalations = useAiStore((state) => state.setEscalations);

  const query = useQuery<AiEscalation[]>({
    queryKey: ['ai-escalations', status],
    queryFn: async () => api.get<AiEscalation[]>('/v1/ai-escalations', { query: { status } }),
  });

  useEffect(() => {
    if (query.data) setEscalations(query.data);
  }, [query.data, setEscalations]);

  return query;
}

export function useResolveEscalation() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const resolveEscalation = useAiStore((state) => state.resolveEscalation);

  return useMutation({
    mutationFn: async (escalationId: string) => api.post<AiEscalation>(`/v1/ai-escalations/${escalationId}/resolve`),
    onSuccess: (_, escalationId) => resolveEscalation(escalationId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['ai-escalations'] }),
  });
}
