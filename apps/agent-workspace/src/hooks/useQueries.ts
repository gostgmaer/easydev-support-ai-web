import { useEffect } from 'react';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@easydev/api-client';
import { useAuth } from '@easydev/auth';
import { useInboxStore, type InboxFilters, type InboxView } from '../store/inboxStore';
import { useConversationStore } from '../store/conversationStore';
import { useTicketStore } from '../store/ticketStore';
import { useCustomerStore } from '../store/customerStore';
import { normalizeConversation, normalizeTicket, priorityToBackend, ticketStatusToBackend } from '../lib/normalize';
import {
  AgentProfile,
  Conversation,
  Customer,
  Message,
  MessageTemplate,
  Ticket,
  TicketComment,
} from '../types';

interface InboxPage {
  data: Conversation[];
  nextCursor?: string;
}

// 1. UNIFIED INBOX (real backend surface is /v1/inbox/*, not a generic /v1/conversations list)
export function useConversations(view: InboxView, filters: InboxFilters, teamId?: string | null) {
  const api = useApiClient();
  const setConversations = useInboxStore((state) => state.setConversations);
  const setPagination = useInboxStore((state) => state.setPagination);
  const bookmarkedIds = useInboxStore((state) => state.bookmarkedIds);

  const query = useInfiniteQuery<InboxPage>({
    queryKey: ['inbox', view, filters, teamId],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const baseQuery: Record<string, string | undefined> = {
        cursor: pageParam as string | undefined,
        limit: '25',
      };
      if (filters.assignedAgentId) baseQuery.assignedAgentId = filters.assignedAgentId;

      let path = '/v1/inbox';
      switch (view) {
        case 'my':
          path = '/v1/inbox/mine';
          break;
        case 'unassigned':
          path = '/v1/inbox/unassigned';
          break;
        case 'team':
          if (!teamId) return { data: [], nextCursor: undefined };
          path = `/v1/inbox/team/${teamId}`;
          break;
        case 'escalated':
          // No "escalated" flag exists in the conversation domain - urgent priority is the
          // closest real, queryable signal for conversations needing immediate attention.
          baseQuery.priority = 'URGENT';
          break;
        case 'snoozed':
          baseQuery.status = 'SNOOZED';
          break;
        case 'bookmarks':
          // No bulk "fetch conversations by id list" endpoint exists - fetch the general
          // listing and filter to the real, server-sourced bookmarked ids client-side below.
          break;
      }

      if (filters.status?.[0] && view !== 'snoozed') baseQuery.status = filters.status[0].toUpperCase();
      if (filters.priority?.[0] && view !== 'escalated') baseQuery.priority = filters.priority[0].toUpperCase();

      const result = await api.get<{ data: Record<string, unknown>[]; nextCursor?: string }>(path, {
        query: baseQuery,
      });
      return { data: result.data.map(normalizeConversation), nextCursor: result.nextCursor };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: view !== 'team' || !!teamId,
  });

  useEffect(() => {
    if (!query.data) return;
    const all = query.data.pages.flatMap((page) => page.data);
    const visible = view === 'bookmarks' ? all.filter((c) => bookmarkedIds.has(c.id)) : all;
    setConversations(visible);
    const lastPage = query.data.pages[query.data.pages.length - 1];
    setPagination({ nextCursor: lastPage?.nextCursor ?? null, hasMore: !!lastPage?.nextCursor });
  }, [query.data, view, bookmarkedIds, setConversations, setPagination]);

  return query;
}

// Real consolidated full-text search across the inbox projection - used by the
// command palette (the standalone /search page covers conversations/tickets/
// customers as three separate calls instead; this is conversations only).
export function useGlobalInboxSearch(query: string) {
  const api = useApiClient();
  return useQuery<Conversation[]>({
    queryKey: ['inbox', 'search', 'global', query],
    queryFn: async () => {
      const result = await api.get<{ data: Record<string, unknown>[] }>('/v1/inbox/search/global', {
        query: { q: query, limit: 5 },
      });
      return result.data.map(normalizeConversation);
    },
    enabled: query.trim().length > 1,
  });
}

export function useConversationDetails(conversationId: string | null) {
  const api = useApiClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);
  const conversations = useInboxStore((state) => state.conversations);
  const appendConversations = useInboxStore((state) => state.appendConversations);

  const query = useQuery<Conversation>({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) throw new Error('Conversation ID is required');
      return normalizeConversation(await api.get<Record<string, unknown>>(`/v1/conversations/${conversationId}`));
    },
    enabled: !!conversationId && !conversations.some((c) => c.id === conversationId),
  });

  useEffect(() => {
    if (query.data) {
      if (conversations.some((c) => c.id === query.data!.id)) updateConversation(query.data.id, query.data);
      else appendConversations([query.data]);
    }
  }, [query.data, conversations, updateConversation, appendConversations]);

  return query;
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

export function useMarkConversationRead() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      return api.post<{ read: boolean }>(`/v1/inbox/${conversationId}/read`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });
}

export function useCustomerDetails(customerId: string | null) {
  const api = useApiClient();
  const setCustomer = useCustomerStore((state) => state.setCustomer);
  return useQuery<Customer>({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) throw new Error('Customer ID is required');
      const data = await api.get<Customer>(`/v1/customers/${customerId}`);
      setCustomer(customerId, data);
      return data;
    },
    enabled: !!customerId,
  });
}

export function useCustomerConversations(customerId: string | null) {
  const api = useApiClient();
  return useQuery<Conversation[]>({
    queryKey: ['customer-conversations', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const result = await api.get<{ data: Record<string, unknown>[] }>('/v1/conversations', {
        query: { customerId },
      });
      return result.data.map(normalizeConversation);
    },
    enabled: !!customerId,
  });
}

export function useCustomerTickets(customerId: string | null) {
  const api = useApiClient();
  return useQuery<Ticket[]>({
    queryKey: ['customer-tickets', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const result = await api.get<{ data: Record<string, unknown>[] }>('/v1/tickets', {
        query: { customerId },
      });
      return result.data.map(normalizeTicket);
    },
    enabled: !!customerId,
  });
}

/** Tickets and conversations are separate entities, not the same id - this resolves the
 * ticket (if any) linked to a conversation via the ticket list's conversationId filter. */
export function useTicketByConversation(conversationId: string | null) {
  const api = useApiClient();
  const setTicket = useTicketStore((state) => state.setTicket);
  return useQuery<Ticket | null>({
    queryKey: ['ticket-by-conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const result = await api.get<{ data: Record<string, unknown>[] }>('/v1/tickets', {
        query: { conversationId },
      });
      if (result.data.length === 0) return null;
      const ticket = normalizeTicket(result.data[0]);
      setTicket(ticket.id, ticket);
      return ticket;
    },
    enabled: !!conversationId,
  });
}

export function useConversationSearch(q: string) {
  const api = useApiClient();
  return useQuery<Conversation[]>({
    queryKey: ['search-conversations', q],
    queryFn: async () => {
      const results = await api.get<Record<string, unknown>[]>('/v1/conversations/search', { query: { q } });
      return results.map(normalizeConversation);
    },
    enabled: q.length > 1,
  });
}

export function useTicketSearch(q: string) {
  const api = useApiClient();
  return useQuery<Ticket[]>({
    queryKey: ['search-tickets', q],
    queryFn: async () => {
      const result = await api.get<{ data: Record<string, unknown>[] }>('/v1/tickets/search', { query: { search: q } });
      return result.data.map(normalizeTicket);
    },
    enabled: q.length > 1,
  });
}

export function useCustomerSearch(q: string) {
  const api = useApiClient();
  return useQuery<Customer[]>({
    queryKey: ['search-customers', q],
    queryFn: async () => {
      const result = await api.get<{ data: Customer[] }>('/v1/customers', { query: { search: q, limit: 20 } });
      return result.data;
    },
    enabled: q.length > 1,
  });
}

export function useTicketDetails(ticketId: string | null) {
  const api = useApiClient();
  const setTicket = useTicketStore((state) => state.setTicket);
  return useQuery<Ticket>({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) throw new Error('Ticket ID is required');
      const data = normalizeTicket(await api.get<Record<string, unknown>>(`/v1/tickets/${ticketId}`));
      setTicket(ticketId, data);
      return data;
    },
    enabled: !!ticketId,
  });
}

export function useUpdatePresence() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      agentProfileId,
      status,
    }: {
      agentProfileId: string;
      status: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';
    }) => {
      return api.put(`/v1/availability/${agentProfileId}`, { status });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-profile', user?.id] });
    },
  });
}

export function useMyAgentProfile() {
  const api = useApiClient();
  const { user } = useAuth();
  return useQuery<AgentProfile | null>({
    queryKey: ['agent-profile', user?.id],
    queryFn: async () => {
      const result = await api.get<{ data: AgentProfile[] }>('/v1/agents', { query: { userId: user!.id } });
      return result.data[0] ?? null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
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

      addMessage(variables.conversationId, tempMessage);
      return { tempMessage };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['messages', variables.conversationId], (old: Message[] | undefined) => {
        const list = old ? [...old] : [];
        return list.map((m) => (m.id.startsWith('temp-') ? data : m));
      });
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
      updateConversation(conversationId, { assignedAgentId: agentId });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });
}

export function useResolveConversation() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);

  return useMutation({
    mutationFn: async ({ conversationId }: { conversationId: string }) => {
      return api.post<Conversation>(`/v1/conversations/${conversationId}/resolve`);
    },
    onMutate: async ({ conversationId }) => {
      updateConversation(conversationId, { status: 'resolved' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });
}

export function useCloseConversation() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);

  return useMutation({
    mutationFn: async ({ conversationId, reason }: { conversationId: string; reason?: string }) => {
      return api.post<Conversation>(`/v1/conversations/${conversationId}/close`, { reason });
    },
    onMutate: async ({ conversationId }) => {
      updateConversation(conversationId, { status: 'resolved' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });
}

// Bookmarks are a real, per-agent backend concept (POST/DELETE /v1/inbox/:id/bookmark,
// GET /v1/inbox/bookmarks) - not a client-only preference.
export function useBookmarkedConversationIds() {
  const api = useApiClient();
  const setBookmarkedIds = useInboxStore((state) => state.setBookmarkedIds);

  return useQuery<Set<string>>({
    queryKey: ['inbox-bookmarks'],
    queryFn: async () => {
      const bookmarks = await api.get<{ conversationId: string }[]>('/v1/inbox/bookmarks');
      const ids = new Set(bookmarks.map((b) => b.conversationId));
      setBookmarkedIds(ids);
      return ids;
    },
  });
}

export function useToggleBookmark() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, bookmarked }: { conversationId: string; bookmarked: boolean }) => {
      if (bookmarked) {
        return api.delete<{ bookmarked: boolean }>(`/v1/inbox/${conversationId}/bookmark`);
      }
      return api.post<{ bookmarked: boolean }>(`/v1/inbox/${conversationId}/bookmark`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-bookmarks'] });
    },
  });
}

// No duration picker exists yet (would need new UI beyond integration wiring) - snoozing
// always parks the conversation for a fixed window, same single-click pattern as bookmarks.
const DEFAULT_SNOOZE_HOURS = 4;

export function useToggleSnooze() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);

  return useMutation({
    mutationFn: async ({ conversationId, snoozed }: { conversationId: string; snoozed: boolean }) => {
      if (snoozed) {
        return api.delete<{ unsnoozed: boolean }>(`/v1/inbox/${conversationId}/snooze`);
      }
      const snoozedUntil = new Date(Date.now() + DEFAULT_SNOOZE_HOURS * 60 * 60 * 1000).toISOString();
      return api.post<{ id: string }>(`/v1/inbox/${conversationId}/snooze`, { snoozedUntil });
    },
    onMutate: async ({ conversationId, snoozed }) => {
      updateConversation(conversationId, { status: snoozed ? 'open' : 'snoozed' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });
}

export function useUpdateTicket() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateTicketState = useTicketStore((state) => state.updateTicket);

  return useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: Partial<Ticket> }) => {
      const payload: Record<string, unknown> = { ...updates };
      if (updates.status) payload.status = ticketStatusToBackend(updates.status);
      if (updates.priority) payload.priority = priorityToBackend(updates.priority);
      return normalizeTicket(await api.put<Record<string, unknown>>(`/v1/tickets/${ticketId}`, payload));
    },
    onMutate: async ({ ticketId, updates }) => {
      updateTicketState(ticketId, updates);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
    },
  });
}

export function useCreateTicket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { conversationId: string; subject: string; priority: Ticket['priority'] }) => {
      return normalizeTicket(
        await api.post<Record<string, unknown>>('/v1/tickets', {
          conversationId: payload.conversationId,
          subject: payload.subject,
          priority: priorityToBackend(payload.priority),
        }),
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.conversationId] });
    },
  });
}

export function useConversationTags(conversationId: string | null) {
  const api = useApiClient();
  return useQuery<string[]>({
    queryKey: ['conversation-tags', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      return api.get<string[]>(`/v1/conversations/${conversationId}/tags`);
    },
    enabled: !!conversationId,
  });
}

export function useAddConversationTag() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, tag }: { conversationId: string; tag: string }) => {
      return api.post<string[]>(`/v1/conversations/${conversationId}/tags`, { tag });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-tags', variables.conversationId] });
    },
  });
}

export function useRemoveConversationTag() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, tag }: { conversationId: string; tag: string }) => {
      return api.delete<void>(`/v1/conversations/${conversationId}/tags/${encodeURIComponent(tag)}`);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-tags', variables.conversationId] });
    },
  });
}

export function useMessageTemplates() {
  const api = useApiClient();
  return useQuery<MessageTemplate[]>({
    queryKey: ['message-templates'],
    queryFn: async () => api.get<MessageTemplate[]>('/v1/message-templates'),
    staleTime: 5 * 60_000,
  });
}

export function useAddTicketComment() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const addComment = useTicketStore((state) => state.addComment);

  return useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
      return api.post<TicketComment>(`/v1/tickets/${ticketId}/comments`, { content });
    },
    onSuccess: (comment, { ticketId }) => addComment(ticketId, comment),
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
    },
  });
}
