import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/uiStore';

let socket: Socket | null = null;

export const useSocket = () => {
  const { tenantId } = useAuthStore();

  useEffect(() => {
    if (!tenantId) return;

    // Connect to the NestJS Realtime Gateway
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1/agent-inbox', {
      auth: {
        token: localStorage.getItem('access_token'), // IAM JWT
      },
    });

    socket.on('connect', () => {
      console.log('Connected to Unified Inbox Realtime Server');
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [tenantId]);

  return socket;
};
