import { useEffect } from 'react';
import { useRealtimeStore, PresenceState } from './useRealtimeStore';

// Mock Socket Type interface to compile without hard dependencies
interface SimpleSocket {
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
}

export function usePresence(socket: SimpleSocket | null, agentId: string) {
  const { setConnected, updatePresence, setTyping, clearTyping } = useRealtimeStore();

  useEffect(() => {
    if (!socket) return;

    // 1. Connection events
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    // 2. Custom Presence state updates
    const handlePresenceUpdate = (data: { agentId: string; status: PresenceState['status'] }) => {
      updatePresence(data.agentId, {
        agentId: data.agentId,
        status: data.status,
        lastSeen: new Date().toISOString()
      });
    };

    // 3. Typing notifications
    const handleTypingStart = (data: { conversationId: string }) => {
      setTyping(data.conversationId, true);
    };

    const handleTypingEnd = (data: { conversationId: string }) => {
      clearTyping(data.conversationId);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:end', handleTypingEnd);

    // Send initial online notify
    socket.emit('presence:register', { agentId, status: 'ONLINE' });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:end', handleTypingEnd);
    };
  }, [socket, agentId, setConnected, updatePresence, setTyping, clearTyping]);
}
