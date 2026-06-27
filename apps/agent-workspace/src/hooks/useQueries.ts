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
      const result = await api.get<{ data: Message[]; total: number; nextCursor?: string }>(
        `/v1/messages/conversation/${conversationId}`,
      );
      setMessages(conversationId, result.data);
      return result.data;
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

export function useSplitTicket() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      messageIds,
      newSubject,
      targetTeamId,
    }: {
      ticketId: string;
      messageIds: string[];
      newSubject?: string;
      targetTeamId?: string;
    }) => {
      return normalizeTicket(
        await api.post<Record<string, unknown>>(`/v1/tickets/${ticketId}/split`, {
          messageIds,
          newSubject,
          targetTeamId,
        }),
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
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

// ─── INBOX COUNTERS & VIEWS ───────────────────────────────────────────────────

export interface InboxCounters {
  all: number;
  mine: number;
  unassigned: number;
  snoozed: number;
  bookmarks: number;
  escalated: number;
}

export function useInboxCounters() {
  const api = useApiClient();
  return useQuery<InboxCounters>({
    queryKey: ['inbox', 'counters'],
    queryFn: () => api.get<InboxCounters>('/v1/inbox/counters'),
    refetchInterval: 30000,
  });
}

export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: string;
}

export function useInboxSavedViews() {
  const api = useApiClient();
  return useQuery<SavedView[]>({
    queryKey: ['inbox', 'saved-views'],
    queryFn: () => api.get<SavedView[]>('/v1/inbox/saved-views'),
  });
}

export function useCreateInboxSavedView() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; filters: Record<string, unknown> }) =>
      api.post<SavedView>('/v1/inbox/saved-views', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox', 'saved-views'] }),
  });
}

export function useDeleteInboxSavedView() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/v1/inbox/saved-views/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox', 'saved-views'] }),
  });
}

// ─── INBOX AI CONTROL ACTIONS ─────────────────────────────────────────────────

export function useTakeOverConversation() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);
  return useMutation({
    mutationFn: (conversationId: string) =>
      api.post<{ success: boolean }>(`/v1/inbox/${conversationId}/take-over`),
    onMutate: (conversationId) => updateConversation(conversationId, { aiStatus: 'paused' }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function useReturnToAi() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);
  return useMutation({
    mutationFn: (conversationId: string) =>
      api.post<{ success: boolean }>(`/v1/inbox/${conversationId}/return-to-ai`),
    onMutate: (conversationId) => updateConversation(conversationId, { aiStatus: 'active' }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function usePauseAi() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      api.post<{ success: boolean }>(`/v1/inbox/${conversationId}/pause-ai`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function useResumeAi() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      api.post<{ success: boolean }>(`/v1/inbox/${conversationId}/resume-ai`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function useDecideAiDraft() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      decision,
      editedContent,
    }: {
      conversationId: string;
      decision: 'APPROVE' | 'REJECT' | 'EDIT';
      editedContent?: string;
    }) => api.post<{ success: boolean }>(`/v1/inbox/${conversationId}/ai-draft`, { decision, editedContent }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function useReplayWorkflow() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      workflowId,
    }: {
      conversationId: string;
      workflowId: string;
    }) => api.post<{ executionId: string }>(`/v1/inbox/${conversationId}/replay-workflow`, { workflowId }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function useRetryConnector() {
  const api = useApiClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      connectorId,
    }: {
      conversationId: string;
      connectorId: string;
    }) => api.post<{ success: boolean }>(`/v1/inbox/${conversationId}/retry-connector`, { connectorId }),
  });
}

// ─── INBOX ASSIGNMENT EXTENDED ───────────────────────────────────────────────

export function useBulkAssign() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationIds, agentProfileId }: { conversationIds: string[]; agentProfileId: string }) =>
      api.post<{ assigned: number }>('/v1/inbox/bulk/assign', { conversationIds, agentProfileId }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function useForceAssign() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);
  return useMutation({
    mutationFn: ({
      conversationId,
      agentProfileId,
    }: {
      conversationId: string;
      agentProfileId: string;
    }) =>
      api.post<{ success: boolean }>(`/v1/inbox/${conversationId}/force-assign`, { agentProfileId }),
    onMutate: ({ conversationId, agentProfileId }) =>
      updateConversation(conversationId, { assignedAgentId: agentProfileId }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function useTransferConversation() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      toAgentProfileId,
      note,
    }: {
      conversationId: string;
      toAgentProfileId: string;
      note?: string;
    }) =>
      api.post<{ success: boolean }>(`/v1/inbox/${conversationId}/transfer`, { toAgentProfileId, note }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function useAssignTeamToConversation() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, teamId }: { conversationId: string; teamId: string }) =>
      api.post<{ success: boolean }>(`/v1/inbox/${conversationId}/assign-team`, { teamId }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function useRoundRobinAssign() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, teamId }: { conversationId: string; teamId: string }) =>
      api.post<{ agentProfileId: string }>(`/v1/inbox/${conversationId}/round-robin`, { teamId }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

export function useUnassignConversation() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);
  return useMutation({
    mutationFn: (conversationId: string) =>
      api.post<{ success: boolean }>(`/v1/inbox/${conversationId}/unassign`),
    onMutate: (conversationId) => updateConversation(conversationId, { assignedAgentId: undefined }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}

// ─── CONVERSATION ACTIVITY FEED ───────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  type: string;
  actorId?: string;
  actorName?: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export function useConversationActivity(conversationId: string | null) {
  const api = useApiClient();
  return useQuery<ActivityEntry[]>({
    queryKey: ['conversation-activity', conversationId],
    queryFn: () =>
      api.get<ActivityEntry[]>(`/v1/inbox/${conversationId}/activity`, { query: { limit: '50' } }),
    enabled: !!conversationId,
  });
}

// ─── PRESENCE ────────────────────────────────────────────────────────────────

export function usePresenceHeartbeat() {
  const api = useApiClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: boolean }>('/v1/inbox/presence/heartbeat'),
  });
}

export function useOnlineAgents() {
  const api = useApiClient();
  return useQuery<{ agentProfileId: string; status: string; lastSeenAt: string }[]>({
    queryKey: ['inbox', 'presence', 'online'],
    queryFn: () =>
      api.get<{ agentProfileId: string; status: string; lastSeenAt: string }[]>('/v1/inbox/presence/online'),
    refetchInterval: 60000,
  });
}

// ─── CONVERSATION NOTES ───────────────────────────────────────────────────────

export interface ConversationNote {
  id: string;
  conversationId: string;
  authorId: string;
  authorName: string;
  content: string;
  mentions: string[];
  createdAt: string;
}

export function useConversationNotes(conversationId: string | null) {
  const api = useApiClient();
  return useQuery<ConversationNote[]>({
    queryKey: ['conversation-notes', conversationId],
    queryFn: () => api.get<ConversationNote[]>(`/v1/conversations/${conversationId}/notes`),
    enabled: !!conversationId,
  });
}

export function useAddConversationNote() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      api.post<ConversationNote>(`/v1/conversations/${conversationId}/notes`, { content }),
    onSuccess: (_, { conversationId }) =>
      queryClient.invalidateQueries({ queryKey: ['conversation-notes', conversationId] }),
  });
}

export function useMentionInNote() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
      noteId,
    }: {
      conversationId: string;
      userId: string;
      noteId: string;
    }) => api.post<{ success: boolean }>(`/v1/conversations/${conversationId}/notes/mentions`, { userId, noteId }),
    onSuccess: (_, { conversationId }) =>
      queryClient.invalidateQueries({ queryKey: ['conversation-notes', conversationId] }),
  });
}

// ─── TICKET LIFECYCLE ACTIONS ─────────────────────────────────────────────────

export function useTicketLifecycleAction() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateTicketState = useTicketStore((state) => state.updateTicket);

  return useMutation({
    mutationFn: async ({
      ticketId,
      action,
      payload,
    }: {
      ticketId: string;
      action: 'start' | 'resolve' | 'close' | 'reopen' | 'escalate';
      payload?: Record<string, unknown>;
    }) => {
      return api.post<{ success: boolean }>(`/v1/tickets/${ticketId}/${action}`, payload ?? {});
    },
    onMutate: ({ ticketId, action }) => {
      const statusMap: Record<string, string> = {
        start: 'in_progress',
        resolve: 'resolved',
        close: 'closed',
        reopen: 'open',
        escalate: 'escalated',
      };
      if (statusMap[action]) updateTicketState(ticketId, { status: statusMap[action] as any });
    },
    onSettled: (_, __, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    },
  });
}

export function useAssignTicket() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      agentProfileId,
    }: {
      ticketId: string;
      agentProfileId: string;
    }) => api.post<{ success: boolean }>(`/v1/tickets/${ticketId}/assign`, { agentProfileId }),
    onSettled: (_, __, { ticketId }) => queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] }),
  });
}

export function useTransferTicket() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      toTeamId,
      note,
    }: {
      ticketId: string;
      toTeamId: string;
      note?: string;
    }) => api.post<{ success: boolean }>(`/v1/tickets/${ticketId}/transfer`, { toTeamId, note }),
    onSettled: (_, __, { ticketId }) => queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] }),
  });
}

export function useTicketApprovals(ticketId: string | null) {
  const api = useApiClient();
  return useQuery<{ id: string; status: string; requesterNote?: string; createdAt: string }[]>({
    queryKey: ['ticket-approvals', ticketId],
    queryFn: () =>
      api.get<{ id: string; status: string; requesterNote?: string; createdAt: string }[]>(
        `/v1/tickets/${ticketId}/approvals`,
      ),
    enabled: !!ticketId,
  });
}

export function useRequestTicketApproval() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, note }: { ticketId: string; note?: string }) =>
      api.post<{ id: string }>(`/v1/tickets/${ticketId}/approvals`, { note }),
    onSuccess: (_, { ticketId }) =>
      queryClient.invalidateQueries({ queryKey: ['ticket-approvals', ticketId] }),
  });
}

export function useDecideTicketApproval() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      approvalId,
      decision,
      note,
      ticketId,
    }: {
      approvalId: string;
      ticketId: string;
      decision: 'approve' | 'reject';
      note?: string;
    }) => api.post<{ success: boolean }>(`/v1/approvals/${approvalId}/${decision}`, { note }),
    onSuccess: (_, { ticketId }) =>
      queryClient.invalidateQueries({ queryKey: ['ticket-approvals', ticketId] }),
  });
}

export function useTicketSla(ticketId: string | null) {
  const api = useApiClient();
  return useQuery<{
    firstResponseSla: { dueAt: string; breached: boolean };
    resolutionSla: { dueAt: string; breached: boolean };
  }>({
    queryKey: ['ticket-sla', ticketId],
    queryFn: () =>
      api.get<{
        firstResponseSla: { dueAt: string; breached: boolean };
        resolutionSla: { dueAt: string; breached: boolean };
      }>(`/v1/tickets/${ticketId}/sla`),
    enabled: !!ticketId,
  });
}

export function useTicketAttachments(ticketId: string | null) {
  const api = useApiClient();
  return useQuery<{ id: string; fileName: string; mimeType: string; sizeBytes: number; url: string }[]>({
    queryKey: ['ticket-attachments', ticketId],
    queryFn: () =>
      api.get<{ id: string; fileName: string; mimeType: string; sizeBytes: number; url: string }[]>(
        `/v1/tickets/${ticketId}/attachments`,
      ),
    enabled: !!ticketId,
  });
}

export function useAddTicketWatcher() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, userId }: { ticketId: string; userId: string }) =>
      api.post<{ success: boolean }>(`/v1/tickets/${ticketId}/watchers`, { userId }),
    onSuccess: (_, { ticketId }) => queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] }),
  });
}

export function useRemoveTicketWatcher() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, userId }: { ticketId: string; userId: string }) =>
      api.delete<void>(`/v1/tickets/${ticketId}/watchers/${userId}`),
    onSuccess: (_, { ticketId }) => queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] }),
  });
}

// ─── MESSAGE EXTENDED ACTIONS ─────────────────────────────────────────────────

export function useAddMessageReaction() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      conversationId,
      emoji,
    }: {
      messageId: string;
      conversationId: string;
      emoji: string;
    }) => api.post<{ success: boolean }>(`/v1/messages/${messageId}/reactions`, { emoji }),
    onSuccess: (_, { conversationId }) =>
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] }),
  });
}

export function useRemoveMessageReaction() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      conversationId,
      emoji,
    }: {
      messageId: string;
      conversationId: string;
      emoji: string;
    }) => api.delete<void>(`/v1/messages/${messageId}/reactions`, { body: { emoji } }),
    onSuccess: (_, { conversationId }) =>
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] }),
  });
}

export function useRetryMessage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, conversationId }: { messageId: string; conversationId: string }) =>
      api.post<{ success: boolean }>(`/v1/messages/${messageId}/retry`),
    onSuccess: (_, { conversationId }) =>
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] }),
  });
}

export function useMessageDelivery(messageId: string | null) {
  const api = useApiClient();
  return useQuery<{
    status: string;
    deliveredAt?: string;
    readAt?: string;
    failureReason?: string;
  }>({
    queryKey: ['message-delivery', messageId],
    queryFn: () =>
      api.get<{ status: string; deliveredAt?: string; readAt?: string; failureReason?: string }>(
        `/v1/messages/${messageId}/delivery`,
      ),
    enabled: !!messageId,
  });
}

export function useDeleteMessage() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, conversationId }: { messageId: string; conversationId: string }) =>
      api.delete<void>(`/v1/messages/${messageId}`),
    onSuccess: (_, { conversationId }) =>
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] }),
  });
}

// ─── DRAFTS ───────────────────────────────────────────────────────────────────

export interface Draft {
  id: string;
  conversationId: string;
  content: string;
  senderType: string;
  isInternalNote: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useMyConversationDraft(conversationId: string | null) {
  const api = useApiClient();
  return useQuery<Draft | null>({
    queryKey: ['draft', conversationId],
    queryFn: async () => {
      const result = await api.get<Draft[]>(`/v1/drafts/conversation/${conversationId}/mine`);
      return result[0] ?? null;
    },
    enabled: !!conversationId,
    staleTime: 0,
  });
}

export function useSaveDraft() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      content,
      isInternalNote,
    }: {
      conversationId: string;
      content: string;
      isInternalNote: boolean;
    }) => api.post<Draft>('/v1/drafts', { conversationId, content, isInternalNote }),
    onSuccess: (_, { conversationId }) =>
      queryClient.invalidateQueries({ queryKey: ['draft', conversationId] }),
  });
}

export function useSendDraft() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, conversationId }: { draftId: string; conversationId: string }) =>
      api.post<{ messageId: string }>(`/v1/drafts/${draftId}/send`),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['draft', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
}

export function useDeleteDraft() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, conversationId }: { draftId: string; conversationId: string }) =>
      api.delete<void>(`/v1/drafts/${draftId}`),
    onSuccess: (_, { conversationId }) =>
      queryClient.invalidateQueries({ queryKey: ['draft', conversationId] }),
  });
}

// ─── CUSTOMER TIMELINE ────────────────────────────────────────────────────────

export function useCustomerTimeline(customerId: string | null) {
  const api = useApiClient();
  return useQuery<{ type: string; data: Record<string, unknown>; createdAt: string }[]>({
    queryKey: ['customer-timeline', customerId],
    queryFn: () =>
      api.get<{ type: string; data: Record<string, unknown>; createdAt: string }[]>(
        `/v1/customers/${customerId}/timeline`,
      ),
    enabled: !!customerId,
  });
}

// ─── IAM PROFILE ─────────────────────────────────────────────────────────────

export interface IamProfile {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
}

export interface IamSession {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export function useIamProfile() {
  const api = useApiClient();
  return useQuery<IamProfile>({
    queryKey: ['iam', 'me', 'profile'],
    queryFn: () => api.get<IamProfile>('/v1/iam/me/profile'),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateIamProfile() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<IamProfile>) => api.patch<IamProfile>('/v1/iam/me/profile', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iam', 'me', 'profile'] }),
  });
}

export function useChangePassword() {
  const api = useApiClient();
  return useMutation({
    mutationFn: (dto: { currentPassword: string; newPassword: string }) =>
      api.post<{ success: boolean }>('/v1/iam/me/password/change', dto),
  });
}

export function useIamSessions() {
  const api = useApiClient();
  return useQuery<IamSession[]>({
    queryKey: ['iam', 'me', 'sessions'],
    queryFn: () => api.get<IamSession[]>('/v1/iam/me/sessions'),
  });
}

export function useRevokeIamSession() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.delete<void>(`/v1/iam/me/sessions/${sessionId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iam', 'me', 'sessions'] }),
  });
}

// ─── ARCHIVE CONVERSATION ─────────────────────────────────────────────────────

export function useArchiveConversation() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const updateConversation = useInboxStore((state) => state.updateConversation);
  return useMutation({
    mutationFn: (conversationId: string) =>
      api.post<{ success: boolean }>(`/v1/conversations/${conversationId}/archive`),
    onMutate: (conversationId) => updateConversation(conversationId, { status: 'archived' as any }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });
}
