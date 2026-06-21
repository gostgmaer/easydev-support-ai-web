import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@easydev/api-client';
import { useAuth } from '@easydev/auth';
import { useInboxStore } from '../store/inboxStore';
import { useConversationStore } from '../store/conversationStore';
import { useTicketStore } from '../store/ticketStore';
import { Conversation, Message, Customer, Ticket, KnowledgeArticle, Notification } from '../types';

// 1. QUERY HOOKS
export function useConversations(view: string, filters: Record<string, unknown>) {
  const api = useApiClient();
  const setConversations = useInboxStore((state) => state.setConversations);
  return useQuery<Conversation[]>({
    queryKey: ['conversations', view, filters],
    queryFn: async () => {
      const data = await api.get<Conversation[]>('/v1/conversations', {
        query: { view, filters: JSON.stringify(filters) },
      });
      setConversations(data);
      return data;
    },
    staleTime: 5000,
  });
}

export function useConversationMessages(conversationId: string | null) {
  const api = useApiClient();
  const setMessages = useConversationStore((state) => state.setMessages);
  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const data = await api.get<Message[]>(`/v1/messages/conversation/${conversationId}`);
      setMessages(conversationId, data);
      return data;
    },
    enabled: !!conversationId,
  });
}

export function useCustomerDetails(customerId: string | null) {
  const api = useApiClient();
  return useQuery<Customer>({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error('Customer ID is required');
      return api.get<Customer>(`/v1/customers/${customerId}`);
    },
    enabled: !!customerId,
  });
}

export function useTicketDetails(ticketId: string | null) {
  const api = useApiClient();
  const setTicket = useTicketStore((state) => state.setTicket);
  return useQuery<Ticket>({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) throw new Error('Ticket ID is required');
      const data = await api.get<Ticket>(`/v1/tickets/${ticketId}`);
      setTicket(ticketId, data);
      return data;
    },
    enabled: !!ticketId,
  });
}

export function useKnowledgeSearch(query: string) {
  const api = useApiClient();
  return useQuery<KnowledgeArticle[]>({
    queryKey: ['knowledge', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      return api.get<KnowledgeArticle[]>('/v1/knowledge-search', { query: { query } });
    },
    enabled: query.length > 1,
  });
}

export function useNotificationsList() {
  const api = useApiClient();
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => api.get<Notification[]>('/v1/notifications'),
  });
}

// 2. MUTATION HOOKS
export function useSendMessage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const addMessage = useConversationStore((state) => state.addMessage);

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      isInternalNote,
    }: {
      conversationId: string;
      content: string;
      isInternalNote: boolean;
    }) => {
      return api.post<Message>('/v1/messages', { conversationId, content, isInternalNote });
    },
    onMutate: async (variables) => {
      // Cancel queries to avoid overwrites
      await queryClient.cancelQueries({ queryKey: ['messages', variables.conversationId] });

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: variables.conversationId,
        senderId: user?.id ?? 'unknown',
        senderName: user?.displayName ?? 'You',
        senderType: 'agent',
        content: variables.content,
        isInternalNote: variables.isInternalNote,
        createdAt: new Date().toISOString(),
      };

      // Optimistically add message
      addMessage(variables.conversationId, tempMessage);

      return { tempMessage };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ['messages', variables.conversationId],
        (old: Message[] | undefined) => {
          const list = old ? [...old] : [];
          return list.map((m) => (m.id.startsWith('temp-') ? data : m));
        }
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
  });
}

export function useAssignConversation() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);

  return useMutation({
    mutationFn: async ({ conversationId, agentId }: { conversationId: string; agentId: string }) => {
      return api.post<Conversation>(`/v1/conversations/${conversationId}/assignment/manual`, {
        agentProfileId: agentId,
      });
    },
    onMutate: async ({ conversationId, agentId }) => {
      // Optimistic update
      updateConversation(conversationId, { assignedAgentId: agentId });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useUpdateAiStatus() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);

  return useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string; status: 'active' | 'paused' | 'takeover' }) => {
      return api.post<Conversation>(`/v1/conversations/${conversationId}/ai-status`, { status });
    },
    onMutate: async ({ conversationId, status }) => {
      updateConversation(conversationId, { aiStatus: status });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useUpdateTicket() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateTicketState = useTicketStore((state) => state.updateTicket);

  return useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: Partial<Ticket> }) => {
      return api.put<Ticket>(`/v1/tickets/${ticketId}`, updates);
    },
    onMutate: async ({ ticketId, updates }) => {
      updateTicketState(ticketId, updates);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
    },
  });
}
