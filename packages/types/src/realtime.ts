export type PresenceStatus = 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';

export interface PresenceUpdatePayload {
  userId: string;
  status: PresenceStatus;
  activeConversationId?: string;
  updatedAt: string;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageEventPayload {
  messageId: string;
  conversationId: string;
  senderId?: string;
  senderType: string;
  content: string;
  createdAt: string;
}

export interface NotificationEventPayload {
  id: string;
  title: string;
  body?: string;
  category: 'TICKET' | 'CONVERSATION' | 'WORKFLOW' | 'AI' | 'SYSTEM';
  link?: string;
  createdAt: string;
}

export interface WorkflowEventPayload {
  executionId: string;
  workflowId: string;
  status: 'STARTED' | 'COMPLETED' | 'FAILED' | 'APPROVAL_REQUESTED';
  conversationId?: string;
}

export interface AiEventPayload {
  conversationId: string;
  confidence?: number;
  escalated?: boolean;
  draftContent?: string;
}

export interface TicketEventPayload {
  ticketId: string;
  status: string;
  conversationId?: string;
}

export interface ReadReceiptPayload {
  conversationId: string;
  userId: string;
  readAt: string;
}

/** Maps every realtime channel event name to its payload shape. */
export interface RealtimeEventMap {
  'presence:update': PresenceUpdatePayload;
  'typing:update': TypingPayload;
  'message:received': MessageEventPayload;
  'message:sent': MessageEventPayload;
  'notification:created': NotificationEventPayload;
  'workflow:update': WorkflowEventPayload;
  'ai:update': AiEventPayload;
  'ticket:update': TicketEventPayload;
  'read-receipt:update': ReadReceiptPayload;
}

export type RealtimeEventName = keyof RealtimeEventMap;

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED' | 'OFFLINE';
