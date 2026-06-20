export type AgentStatus = 'online' | 'busy' | 'offline';

export interface PresenceUser {
  id: string;
  name: string;
  avatar: string;
  status: AgentStatus;
  role: 'agent' | 'manager' | 'admin';
}

export type ConversationStatus = 'open' | 'snoozed' | 'resolved' | 'escalated';
export type ConversationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AiStatus = 'active' | 'paused' | 'takeover';

export interface MessageReaction {
  emoji: string;
  users: string[]; // list of agentIds
}

export interface ReadReceipt {
  userId: string;
  timestamp: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderType: 'customer' | 'agent' | 'system' | 'ai';
  content: string;
  isInternalNote: boolean;
  createdAt: string;
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  reactions?: MessageReaction[];
  readReceipts?: ReadReceipt[];
}

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  subject: string;
  updatedAt: string;
  unreadCount: number;
  assignedAgentId?: string;
  aiStatus: AiStatus;
  slaDueDate?: string;
  lastMessage?: string;
  bookmarked?: boolean;
  snoozedUntil?: string;
}

export interface CustomerOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface CustomerNote {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  riskIndicator?: 'low' | 'medium' | 'high';
  isVip?: boolean;
  tags: string[];
  segments: string[];
  orders: CustomerOrder[];
  notes: CustomerNote[];
}

export type TicketStatus = 'open' | 'pending' | 'solved' | 'closed';

export interface TicketApproval {
  id: string;
  approverId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface TicketComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  conversationId: string;
  subject: string;
  status: TicketStatus;
  priority: ConversationPriority;
  assigneeId?: string;
  slaStatus: 'on_time' | 'at_risk' | 'breached';
  escalated: boolean;
  comments: TicketComment[];
  approvals: TicketApproval[];
  relatedTickets: string[]; // NCT IDs
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'mention' | 'assignment' | 'sla_risk' | 'escalation';
  read: boolean;
  createdAt: string;
  referenceId?: string;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  status: 'pending' | 'success' | 'failed';
  result?: string;
}

export interface AiDraft {
  conversationId: string;
  content: string;
  confidence: number;
  cost: number;
  workflowStatus: 'running' | 'completed' | 'failed' | 'idle';
  toolCalls: ToolCall[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  score: number;
  category: string;
}
