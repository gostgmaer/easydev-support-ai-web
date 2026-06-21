import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWidgetStore, WidgetMessage, HelpArticle, TicketSummary, CustomerSession } from '../store/widgetStore';

const widgetRequest = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333/api';
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-EasyDev-Tenant': useWidgetStore.getState().tenantId || '',
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Widget API Error: ${response.statusText}`);
  }
  return response.json();
};

// 1. MESSAGES & TIMELINE
export function useConversationTimeline(conversationId: string | null) {
  const setMessages = useWidgetStore((state) => state.setMessages);
  return useQuery<WidgetMessage[]>({
    queryKey: ['widget', 'messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const data = await widgetRequest<WidgetMessage[]>(`/widget/conversations/${conversationId}/messages`);
      setMessages(data);
      return data;
    },
    enabled: !!conversationId,
  });
}

export function useSendWidgetMessage() {
  const queryClient = useQueryClient();
  const addMessage = useWidgetStore((state) => state.addMessage);

  return useMutation({
    mutationFn: async ({ conversationId, content, attachments }: { conversationId: string; content: string; attachments?: WidgetMessage['attachments'] }) => {
      return widgetRequest<WidgetMessage>(`/widget/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, attachments }),
      });
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['widget', 'messages', variables.conversationId] });
      
      const tempMessage: WidgetMessage = {
        id: `temp-${Date.now()}`,
        senderType: 'customer',
        senderName: 'You',
        content: variables.content,
        createdAt: new Date().toISOString(),
        attachments: variables.attachments,
      };

      addMessage(tempMessage);
      return { tempMessage };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ['widget', 'messages', variables.conversationId],
        (old: WidgetMessage[] | undefined) => {
          const list = old ? [...old] : [];
          return list.map((m) => (m.id.startsWith('temp-') ? data : m));
        }
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['widget', 'messages', variables.conversationId] });
    },
  });
}

// 2. KNOWLEDGE BASE SEARCH
export function useKnowledgeArticles(query: string) {
  const setArticles = useWidgetStore((state) => state.setArticles);
  return useQuery<HelpArticle[]>({
    queryKey: ['widget', 'articles', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const data = await widgetRequest<HelpArticle[]>(`/widget/knowledge?query=${encodeURIComponent(query)}`);
      setArticles(data);
      return data;
    },
    enabled: query.length > 1,
  });
}

export function useSuggestedArticles() {
  return useQuery<HelpArticle[]>({
    queryKey: ['widget', 'articles', 'suggested'],
    queryFn: async () => {
      return widgetRequest<HelpArticle[]>('/widget/knowledge/suggested');
    },
  });
}

// 3. AUTHENTICATION & SESSION
export function useRequestMagicLink() {
  return useMutation({
    mutationFn: async (email: string) => {
      return widgetRequest<{ success: boolean }>('/widget/auth/magic-link', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  });
}

export function useVerifyOtp() {
  const setSession = useWidgetStore((state) => state.setSession);

  return useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      return widgetRequest<CustomerSession>('/widget/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
    },
    onSuccess: (data) => {
      setSession(data);
    },
  });
}

// 4. ORDER LOOKUP
export interface OrderLookupDetails {
  id: string;
  status: string;
  eta: string;
  trackingUrl?: string;
  total: number;
}

export function useOrderLookup(orderId: string, email: string) {
  return useQuery<OrderLookupDetails>({
    queryKey: ['widget', 'order', orderId],
    queryFn: async () => {
      if (!orderId || !email) throw new Error('Order details missing');
      return widgetRequest<OrderLookupDetails>(`/widget/orders/${orderId}?email=${encodeURIComponent(email)}`);
    },
    enabled: !!orderId && !!email,
  });
}

// 5. TICKET MANAGEMENT
export function useWidgetTickets() {
  const setTickets = useWidgetStore((state) => state.setTickets);
  return useQuery<TicketSummary[]>({
    queryKey: ['widget', 'tickets'],
    queryFn: async () => {
      const data = await widgetRequest<TicketSummary[]>('/widget/tickets');
      setTickets(data);
      return data;
    },
  });
}

export function useCreateWidgetTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { subject: string; description: string; email: string }) => {
      return widgetRequest<TicketSummary>('/widget/tickets', {
        method: 'POST',
        body: JSON.stringify(variables),
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['widget', 'tickets'], (old: TicketSummary[] | undefined) => {
        return old ? [data, ...old] : [data];
      });
    },
  });
}

// 6. SURVEY FEEDBACK
export function useSubmitFeedback() {
  return useMutation({
    mutationFn: async (variables: { rating: number; comment?: string; category: 'agent' | 'ai' }) => {
      return widgetRequest<{ success: boolean }>('/widget/feedback', {
        method: 'POST',
        body: JSON.stringify(variables),
      });
    },
  });
}

// 7. CONVERSATION HISTORY
export interface ConversationItem {
  id: string;
  subject?: string;
  status: string;
  createdAt: string;
  lastMessageText?: string;
}

export function useCustomerConversations() {
  return useQuery<ConversationItem[]>({
    queryKey: ['widget', 'conversations'],
    queryFn: async () => {
      return widgetRequest<ConversationItem[]>('/widget/conversations');
    },
  });
}
