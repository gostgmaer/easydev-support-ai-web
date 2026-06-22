import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketConnection } from '@easydev/realtime';
import { useWidgetStore } from '../store/widgetStore';
import { toWidgetMessage, RawMessage } from './useWidgetQueries';

export function useWidgetRealtime(conversationId: string | null) {
  const queryClient = useQueryClient();
  const addMessage = useWidgetStore((state) => state.addMessage);
  const sessionToken = useWidgetStore((state) => state.sessionToken);
  const tenantId = useWidgetStore((state) => state.tenantId);

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3333';

  // Only connects once there's an actual conversation to support - a visitor
  // browsing the welcome/help/tickets pages never mounts this hook at all
  // (it's only called from the chat page), and gating on conversationId here
  // too means even a brief pre-redirect render on /chat can't open one early.
  const { socket } = useSocketConnection({
    url: sessionToken && tenantId && conversationId ? `${socketUrl}/v1/widget-chat` : null,
    getAuth: () => ({ token: sessionToken }),
    query: tenantId ? { tenantId } : undefined,
    onReconnect: () => queryClient.invalidateQueries({ queryKey: ['widget', 'messages'] }),
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (raw: RawMessage) => {
      addMessage(toWidgetMessage(raw));
      if (conversationId) {
        socket.emit('read_receipt', { messageId: raw.id, conversationId });
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, conversationId, addMessage]);

  const emitTyping = (isTyping: boolean) => {
    if (conversationId) {
      socket?.emit('typing', { isTyping, conversationId });
    }
  };

  return {
    socket,
    emitTyping,
  };
}
