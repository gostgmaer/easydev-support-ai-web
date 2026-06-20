import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInboxStore } from '../store/inboxStore';
import { useConversationStore } from '../store/conversationStore';
import { useTicketStore } from '../store/ticketStore';
import { Conversation, Message, Customer, Ticket, KnowledgeArticle, Notification } from '../types';

// Mock API Call helpers simulating server interactions
const apiRequest = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-agent-token',
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

// 1. QUERY HOOKS
export function useConversations(view: string, filters: Record<string, unknown>) {
  const setConversations = useInboxStore((state) => state.setConversations);
  return useQuery<Conversation[]>({
    queryKey: ['conversations', view, filters],
    queryFn: async () => {
      // simulate delay/mock fetch in production-ready way pointing to real path
      const data = await apiRequest<Conversation[]>(`/conversations?view=${view}&filters=${JSON.stringify(filters)}`);
      setConversations(data);
      return data;
    },
    staleTime: 5000,
  });
}

export function useConversationMessages(conversationId: string | null) {
  const setMessages = useConversationStore((state) => state.setMessages);
  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const data = await apiRequest<Message[]>(`/conversations/${conversationId}/messages`);
      setMessages(conversationId, data);
      return data;
    },
    enabled: !!conversationId,
  });
}

export function useCustomerDetails(customerId: string | null) {
  return useQuery<Customer>({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error('Customer ID is required');
      return apiRequest<Customer>(`/customers/${customerId}`);
    },
    enabled: !!customerId,
  });
}

export function useTicketDetails(ticketId: string | null) {
  const setTicket = useTicketStore((state) => state.setTicket);
  return useQuery<Ticket>({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) throw new Error('Ticket ID is required');
      const data = await apiRequest<Ticket>(`/tickets/${ticketId}`);
      setTicket(ticketId, data);
      return data;
    },
    enabled: !!ticketId,
  });
}

export function useKnowledgeSearch(query: string) {
  return useQuery<KnowledgeArticle[]>({
    queryKey: ['knowledge', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      return apiRequest<KnowledgeArticle[]>(`/knowledge?query=${encodeURIComponent(query)}`);
    },
    enabled: query.length > 1,
  });
}

export function useNotificationsList() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      return apiRequest<Notification[]>('/notifications');
    },
  });
}

// 2. MUTATION HOOKS
export function useSendMessage() {
  const queryClient = useQueryClient();
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
      return apiRequest<Message>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, isInternalNote }),
      });
    },
    onMutate: async (variables) => {
      // Cancel queries to avoid overwrites
      await queryClient.cancelQueries({ queryKey: ['messages', variables.conversationId] });
      
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: variables.conversationId,
        senderId: 'current-agent',
        senderName: 'You',
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
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);

  return useMutation({
    mutationFn: async ({ conversationId, agentId }: { conversationId: string; agentId: string }) => {
      return apiRequest<Conversation>(`/conversations/${conversationId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ agentId }),
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
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);

  return useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string; status: 'active' | 'paused' | 'takeover' }) => {
      return apiRequest<Conversation>(`/conversations/${conversationId}/ai-status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
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
  const queryClient = useQueryClient();
  const updateTicketState = useTicketStore((state) => state.updateTicket);

  return useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: Partial<Ticket> }) => {
      return apiRequest<Ticket>(`/tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onMutate: async ({ ticketId, updates }) => {
      updateTicketState(ticketId, updates);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
    },
  });
}
