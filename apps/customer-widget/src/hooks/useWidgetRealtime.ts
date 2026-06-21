import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWidgetStore, WidgetMessage } from '../store/widgetStore';

let widgetSocketInstance: Socket | null = null;

export const getWidgetSocket = () => {
  if (!widgetSocketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    widgetSocketInstance = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });
  }
  return widgetSocketInstance;
};

export function useWidgetRealtime(conversationId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const addMessage = useWidgetStore((state) => state.addMessage);
  const setAgentTyping = useWidgetStore((state) => state.setAgentTyping);

  useEffect(() => {
    if (!conversationId) return;

    const socket = getWidgetSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    // Join room for this conversation
    socket.emit('join:conversation', { conversationId });

    socket.on('message:new', (data: { conversationId: string; message: WidgetMessage }) => {
      if (data.conversationId === conversationId) {
        addMessage(data.message);
        
        // Emit read receipt instantly
        socket.emit('receipt:read', { conversationId, messageId: data.message.id });
      }
    });

    socket.on('typing:status', (data: { conversationId: string; userId: string; isTyping: boolean; name: string }) => {
      if (data.conversationId === conversationId && data.name !== 'You') {
        setAgentTyping(data.isTyping);
      }
    });

    socket.on('agent:joined', (data: { name: string }) => {
      addMessage({
        id: `sys-${Date.now()}`,
        senderType: 'system',
        senderName: 'System',
        content: `Agent ${data.name} has joined the conversation.`,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on('agent:left', (data: { name: string }) => {
      addMessage({
        id: `sys-${Date.now()}`,
        senderType: 'system',
        senderName: 'System',
        content: `Agent ${data.name} has left the conversation.`,
        createdAt: new Date().toISOString(),
      });
    });

    return () => {
      socket.emit('leave:conversation', { conversationId });
      socket.off('message:new');
      socket.off('typing:status');
      socket.off('agent:joined');
      socket.off('agent:left');
    };
  }, [conversationId, addMessage, setAgentTyping]);

  const emitTyping = (isTyping: boolean) => {
    if (conversationId) {
      socketRef.current?.emit('typing:status', { conversationId, isTyping });
    }
  };

  return {
    socket: socketRef.current,
    emitTyping,
  };
}
