import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@easydev/stores';
import { useRealtimeStore } from '../store/realtimeStore';
import { useInboxStore } from '../store/inboxStore';
import { useConversationStore } from '../store/conversationStore';
import { useTicketStore } from '../store/ticketStore';
import { useAiStore } from '../store/aiStore';
import {
  Conversation,
  ConversationStatus,
  ConversationPriority,
  Ticket,
  TicketStatus,
  PresenceUser,
  AiEscalation,
  AiSessionState,
  AiSessionStatus,
} from '../types';

let socketInstance: Socket | null = null;

/**
 * The real gateway is InboxRealtimeService, mounted on the /v1/inbox/realtime
 * namespace (see Backend src/modules/inbox/services/inbox-realtime.service.ts).
 * It is NOT the bare root namespace.
 */
export const getSocket = () => {
  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    socketInstance = io(`${socketUrl}/v1/inbox/realtime`, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });
  }
  return socketInstance;
};

/** Every broadcast event is wrapped this way by InboxRealtimeService.emitToTenant,
 * except the two client-fed events (inbox.typing / inbox.read-receipt) which are flat. */
interface RealtimeEnvelope<T> {
  timestamp: string;
  data: T;
}

function mapInboxStatus(status?: string): ConversationStatus {
  switch (status) {
    case 'WAITING_AGENT':
    case 'SNOOZED':
      return 'snoozed';
    case 'RESOLVED':
    case 'ARCHIVED':
      return 'resolved';
    case 'OPEN':
    case 'PENDING':
    case 'WAITING_CUSTOMER':
    default:
      return 'open';
  }
}

function mapInboxPriority(priority?: string): ConversationPriority {
  switch (priority) {
    case 'HIGH':
      return 'high';
    case 'URGENT':
    case 'CRITICAL':
      return 'urgent';
    case 'LOW':
      return 'low';
    case 'MEDIUM':
    default:
      return 'medium';
  }
}

function mapTicketStatus(status?: string): TicketStatus {
  switch (status) {
    case 'WAITING_CUSTOMER':
    case 'WAITING_INTERNAL':
    case 'APPROVAL_PENDING':
      return 'pending';
    case 'RESOLVED':
      return 'solved';
    case 'CLOSED':
    case 'CANCELLED':
      return 'closed';
    case 'OPEN':
    case 'ASSIGNED':
    case 'IN_PROGRESS':
    case 'REOPENED':
    default:
      return 'open';
  }
}

function mapPresenceStatus(status?: string): PresenceUser['status'] {
  switch (status) {
    case 'ONLINE':
      return 'online';
    case 'AWAY':
    case 'BUSY':
      return 'busy';
    case 'OFFLINE':
    default:
      return 'offline';
  }
}

function mapAiSessionStatus(status?: string): AiSessionStatus {
  switch (status) {
    case 'COMPLETED':
      return 'completed';
    case 'ACTIVE':
    case 'CLOSED':
    default:
      return 'idle';
  }
}

/** Shape of InboxView.toJSON() (Backend src/modules/inbox/domain/inbox-view.aggregate.ts). */
interface InboxViewPayload {
  conversationId: string;
  customerId?: string;
  assignedAgentId?: string;
  status?: string;
  priority?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageAt?: string;
}

function inboxViewToConversationPatch(view: InboxViewPayload): Partial<Conversation> {
  return {
    customerId: view.customerId,
    assignedAgentId: view.assignedAgentId,
    status: mapInboxStatus(view.status),
    priority: mapInboxPriority(view.priority),
    unreadCount: view.unreadCount,
    lastMessage: view.lastMessage,
    updatedAt: view.lastMessageAt,
  };
}

export function useRealtime(agentId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const setConnected = useRealtimeStore((state) => state.setConnected);
  const setConnectionStatus = useRealtimeStore((state) => state.setConnectionStatus);
  const updatePresence = useRealtimeStore((state) => state.updatePresence);

  const setTyping = useConversationStore((state) => state.setTyping);

  const updateConversation = useInboxStore((state) => state.updateConversation);
  const updateTicket = useTicketStore((state) => state.updateTicket);

  const setAiSession = useAiStore((state) => state.setSession);
  const addAiEscalation = useAiStore((state) => state.addEscalation);
  const resolveAiEscalation = useAiStore((state) => state.resolveEscalation);

  useEffect(() => {
    if (!agentId) return;
    const token = useAuthStore.getState().tokens?.accessToken;
    if (!token) return;

    const socket = getSocket();
    socketRef.current = socket;

    // The gateway authenticates the handshake via the real bearer token (see
    // InboxRealtimeService.handleConnection) and derives tenant/user rooms from it -
    // it does not use a client-claimed agentId for anything.
    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      setConnected(true);
      setConnectionStatus('CONNECTED');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setConnectionStatus('DISCONNECTED');
    });

    socket.io.on('reconnect_attempt', () => {
      setConnectionStatus('RECONNECTING');
    });

    socket.io.on('reconnect', () => {
      setConnectionStatus('CONNECTED');
      queryClient.invalidateQueries();
    });

    socket.on(
      'inbox.conversation.updated',
      (msg: RealtimeEnvelope<InboxViewPayload>) => {
        const view = msg.data;
        updateConversation(view.conversationId, inboxViewToConversationPatch(view));
        queryClient.invalidateQueries({ queryKey: ['inbox'] });
        queryClient.invalidateQueries({ queryKey: ['conversation', view.conversationId] });
      },
    );

    socket.on('inbox.message.updated', (msg: RealtimeEnvelope<InboxViewPayload>) => {
      const view = msg.data;
      updateConversation(view.conversationId, inboxViewToConversationPatch(view));
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
      // The view only carries a lastMessage summary, not the full Message object -
      // refetch the real thread content via REST.
      queryClient.invalidateQueries({ queryKey: ['messages', view.conversationId] });
    });

    socket.on(
      'inbox.assignment.updated',
      (msg: RealtimeEnvelope<{ conversationId: string; assignedAgentId?: string }>) => {
        const { conversationId, assignedAgentId } = msg.data;
        updateConversation(conversationId, { assignedAgentId });
        queryClient.invalidateQueries({ queryKey: ['inbox'] });
      },
    );

    socket.on(
      'inbox.status.changed',
      (
        msg: RealtimeEnvelope<{
          conversationId: string;
          status?: string;
          unreadCount?: number;
          snoozedUntil?: string;
        }>,
      ) => {
        const data = msg.data;
        const patch: Partial<Conversation> = {};
        if (data.status !== undefined) patch.status = mapInboxStatus(data.status);
        if (data.unreadCount !== undefined) patch.unreadCount = data.unreadCount;
        if (data.snoozedUntil !== undefined) patch.snoozedUntil = data.snoozedUntil;
        updateConversation(data.conversationId, patch);
        queryClient.invalidateQueries({ queryKey: ['inbox'] });
      },
    );

    socket.on(
      'inbox.presence.updated',
      (
        msg: RealtimeEnvelope<{
          userId: string;
          status: string;
          activeConversationId?: string;
        }>,
      ) => {
        const data = msg.data;
        // The presence domain only knows status/activeConversationId, not display
        // profile fields - merge onto whatever we already know rather than
        // overwriting name/avatar/role with fabricated placeholders.
        const existing = useRealtimeStore.getState().agentPresence[data.userId];
        updatePresence(data.userId, {
          id: data.userId,
          name: existing?.name ?? data.userId,
          avatar: existing?.avatar ?? '',
          role: existing?.role ?? 'agent',
          status: mapPresenceStatus(data.status),
        });
      },
    );

    // Client-fed events: not enveloped, broadcast verbatim by
    // InboxRealtimeService.handleTyping / handleReadReceipt.
    socket.on(
      'inbox.typing',
      (data: { conversationId: string; userId: string; isTyping: boolean }) => {
        // Backend doesn't send a display name - fall back to the userId itself
        // rather than inventing one.
        setTyping(data.conversationId, data.userId, data.userId, data.isTyping);
      },
    );
    // inbox.read-receipt is conversation-scoped on the backend (no messageId), so it
    // can't drive the per-message read-receipt UI without fabricating a messageId.
    // Left unwired until the backend carries enough data to do this honestly.

    socket.on('ticket.updated', (msg: RealtimeEnvelope<Ticket & { conversationId?: string }>) => {
      const t = msg.data as any;
      updateTicket(t.id, {
        status: mapTicketStatus(t.status),
        priority: mapInboxPriority(t.priority),
        assigneeId: t.assignedAgentId,
      });
      queryClient.invalidateQueries({ queryKey: ['ticket', t.id] });
      if (t.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['ticket-by-conversation', t.conversationId] });
      }
    });

    socket.on(
      'ai.escalation.updated',
      (
        msg: RealtimeEnvelope<{
          id: string;
          conversationId: string;
          reason: string;
          createdAt: string;
          status: string;
        }>,
      ) => {
        const data = msg.data;
        const escalation: AiEscalation = {
          id: data.id,
          conversationId: data.conversationId,
          reason: data.reason,
          createdAt: data.createdAt,
          status: data.status === 'RESOLVED' ? 'resolved' : 'pending',
        };
        if (escalation.status === 'resolved') {
          resolveAiEscalation(escalation.id);
        } else {
          addAiEscalation(escalation);
        }
        queryClient.invalidateQueries({ queryKey: ['ai-escalations'] });
      },
    );

    socket.on(
      'ai.session.updated',
      (
        msg: RealtimeEnvelope<{
          conversationId: string;
          sessionState?: { status?: string; workflowStep?: string };
        }>,
      ) => {
        const data = msg.data;
        const session: AiSessionState = {
          conversationId: data.conversationId,
          status: mapAiSessionStatus(data.sessionState?.status),
          workflowStep: data.sessionState?.workflowStep,
        };
        setAiSession(data.conversationId, session);
        queryClient.invalidateQueries({ queryKey: ['ai-session', data.conversationId] });
      },
    );

    socket.on('workflow.execution.updated', (msg: RealtimeEnvelope<{ id: string }>) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-execution', msg.data.id] });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.io.off('reconnect_attempt');
      socket.io.off('reconnect');
      socket.off('inbox.conversation.updated');
      socket.off('inbox.message.updated');
      socket.off('inbox.assignment.updated');
      socket.off('inbox.status.changed');
      socket.off('inbox.presence.updated');
      socket.off('inbox.typing');
      socket.off('ticket.updated');
      socket.off('ai.escalation.updated');
      socket.off('ai.session.updated');
      socket.off('workflow.execution.updated');
    };
  }, [
    agentId,
    queryClient,
    setConnected,
    setConnectionStatus,
    updatePresence,
    setTyping,
    updateConversation,
    updateTicket,
    setAiSession,
    addAiEscalation,
    resolveAiEscalation,
  ]);

  // Emitters - match InboxRealtimeService's @SubscribeMessage handlers exactly.
  const emitTyping = (conversationId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { conversationId, isTyping });
  };

  const emitRead = (conversationId: string) => {
    socketRef.current?.emit('read-receipt', { conversationId });
  };

  // The real gateway only has tenant-wide and user-wide rooms - there is no
  // per-conversation room to join/leave. Kept as no-ops for API stability.
  const joinConversation = (_conversationId: string) => {};
  const leaveConversation = (_conversationId: string) => {};

  return {
    socket: socketRef.current,
    emitTyping,
    emitRead,
    joinConversation,
    leaveConversation,
  };
}
