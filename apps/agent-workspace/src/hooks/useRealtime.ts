import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@easydev/stores';
import { useRealtimeStore } from '../store/realtimeStore';
import { useInboxStore } from '../store/inboxStore';
import { useConversationStore } from '../store/conversationStore';
import { useTicketStore } from '../store/ticketStore';
import { useNotificationStore } from '../store/notificationStore';
import { Message, Conversation, Ticket, PresenceUser, AiDraft, Notification } from '../types';

let socketInstance: Socket | null = null;

export const getSocket = () => {
  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    socketInstance = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });
  }
  return socketInstance;
};

export function useRealtime(agentId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const setConnected = useRealtimeStore((state) => state.setConnected);
  const updatePresence = useRealtimeStore((state) => state.updatePresence);
  const setPresenceList = useRealtimeStore((state) => state.setPresenceList);
  const removePresence = useRealtimeStore((state) => state.removePresence);
  
  const addMessage = useConversationStore((state) => state.addMessage);
  const setTyping = useConversationStore((state) => state.setTyping);
  const setAiDraft = useConversationStore((state) => state.setAiDraft);
  const updateMessageReadReceipts = useConversationStore((state) => state.updateMessageReadReceipts);
  
  const updateConversation = useInboxStore((state) => state.updateConversation);
  const updateTicket = useTicketStore((state) => state.updateTicket);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (!agentId) return;

    const socket = getSocket();
    socketRef.current = socket;

    // The gateway authenticates the socket handshake the same way as REST calls -
    // via the real bearer token, not the agentId alone (which is just routing info).
    socket.auth = { agentId, token: useAuthStore.getState().tokens?.accessToken };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('agent:presence:online', { agentId });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Realtime Handlers
    socket.on('presence:list', (list: Record<string, PresenceUser>) => {
      setPresenceList(list);
    });

    socket.on('presence:update', (data: { agentId: string; presence: PresenceUser }) => {
      updatePresence(data.agentId, data.presence);
    });

    socket.on('presence:offline', (data: { agentId: string }) => {
      removePresence(data.agentId);
    });

    socket.on('message:new', (data: { conversationId: string; message: Message }) => {
      addMessage(data.conversationId, data.message);
      updateConversation(data.conversationId, {
        lastMessage: data.message.content,
        updatedAt: data.message.createdAt,
        unreadCount: data.message.senderType === 'customer' ? undefined : 0, // handoff logic handled by server, we optimistic update
      });
    });

    socket.on('typing:status', (data: { conversationId: string; userId: string; name: string; isTyping: boolean }) => {
      setTyping(data.conversationId, data.userId, data.name, data.isTyping);
    });

    socket.on('receipt:read', (data: { conversationId: string; messageId: string; receipts: { userId: string; timestamp: string }[] }) => {
      updateMessageReadReceipts(data.conversationId, data.messageId, data.receipts);
    });

    socket.on('conversation:updated', (data: { id: string; updates: Partial<Conversation> }) => {
      updateConversation(data.id, data.updates);
    });

    socket.on('ticket:updated', (data: { id: string; updates: Partial<Ticket> }) => {
      updateTicket(data.id, data.updates);
    });

    socket.on('ai:draft_suggested', (data: { conversationId: string; draft: AiDraft }) => {
      setAiDraft(data.conversationId, data.draft);
    });

    socket.on('notification:new', (notification: Notification) => {
      addNotification(notification);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('presence:list');
      socket.off('presence:update');
      socket.off('presence:offline');
      socket.off('message:new');
      socket.off('typing:status');
      socket.off('receipt:read');
      socket.off('conversation:updated');
      socket.off('ticket:updated');
      socket.off('ai:draft_suggested');
      socket.off('notification:new');
    };
  }, [agentId, setConnected, updatePresence, setPresenceList, removePresence, addMessage, setTyping, setAiDraft, updateMessageReadReceipts, updateConversation, updateTicket, addNotification]);

  // Emitters
  const emitTyping = (conversationId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing:status', { conversationId, isTyping });
  };

  const emitRead = (conversationId: string, messageId: string) => {
    socketRef.current?.emit('receipt:read', { conversationId, messageId });
  };

  const joinConversation = (conversationId: string) => {
    socketRef.current?.emit('join:conversation', { conversationId });
  };

  const leaveConversation = (conversationId: string) => {
    socketRef.current?.emit('leave:conversation', { conversationId });
  };

  return {
    socket: socketRef.current,
    emitTyping,
    emitRead,
    joinConversation,
    leaveConversation,
  };
}
