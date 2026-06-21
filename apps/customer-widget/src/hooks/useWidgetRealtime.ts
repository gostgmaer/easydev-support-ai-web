import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWidgetStore } from '../store/widgetStore';
import { toWidgetMessage, RawMessage } from './useWidgetQueries';

let widgetSocketInstance: Socket | null = null;
let widgetSocketKey: string | null = null;

/** Connects to the real WidgetRealtimeGateway (`/v1/widget-chat`), authenticated with the
 * same session token issued by POST /v1/widget/session/start. tenantId travels via the
 * `query` param (not a header) since browsers can't set custom headers on a websocket
 * upgrade - the gateway's handleConnection() already falls back to handshake.query.tenantId. */
function getWidgetSocket(token: string, tenantId: string): Socket {
  const key = `${tenantId}:${token}`;
  if (widgetSocketInstance && widgetSocketKey === key) {
    return widgetSocketInstance;
  }
  if (widgetSocketInstance) {
    widgetSocketInstance.disconnect();
  }
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3333';
  widgetSocketInstance = io(`${socketUrl}/v1/widget-chat`, {
    auth: { token },
    query: { tenantId },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    transports: ['websocket'],
  });
  widgetSocketKey = key;
  return widgetSocketInstance;
}

export function useWidgetRealtime(conversationId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const addMessage = useWidgetStore((state) => state.addMessage);
  const sessionToken = useWidgetStore((state) => state.sessionToken);
  const tenantId = useWidgetStore((state) => state.tenantId);

  useEffect(() => {
    if (!sessionToken || !tenantId) return;

    const socket = getWidgetSocket(sessionToken, tenantId);
    socketRef.current = socket;

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
  }, [sessionToken, tenantId, conversationId, addMessage]);

  // Lets agents see that the visitor is typing - the gateway relays this to the
  // tenant's agent room. There is no corresponding "agent is typing" broadcast back
  // to the widget, so this hook intentionally only emits and never sets local state.
  const emitTyping = (isTyping: boolean) => {
    if (conversationId) {
      socketRef.current?.emit('typing', { isTyping, conversationId });
    }
  };

  return {
    socket: socketRef.current,
    emitTyping,
  };
}
