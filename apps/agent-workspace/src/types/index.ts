import type { PresenceStatus as PresenceStatusValue } from '@easydev/types';

// PresenceUser/AgentStatus moved to @easydev/realtime/realtime-store - the
// shared realtime store both agent-workspace and customer-widget now use.

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
  /** Optimistic-UI only — set to 'failed' when the send mutation errors out. */
  status?: 'failed';
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

export interface TicketTag {
  id: string;
  tag: string;
}

export interface TicketWatcher {
  id: string;
  userId: string;
}

export interface Ticket {
  id: string;
  conversationId: string;
  subject: string;
  status: TicketStatus;
  priority: ConversationPriority;
  assignedAgentId?: string;
  assignedTeamId?: string;
  slaStatus: 'on_time' | 'at_risk' | 'breached';
  escalated: boolean;
  comments: TicketComment[];
  approvals: TicketApproval[];
  relatedTickets: string[]; // NCT IDs
  tags: TicketTag[];
  watchers: TicketWatcher[];
  resolutionSummary?: string;
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

/** A file attached to the composer before/while it's being uploaded - distinct from
 * Message['attachments'], which is the immutable, already-sent attachment list. */
export interface AttachmentMeta {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'failed';
  progress: number;
  url?: string;
}

export type AiSessionStatus = 'idle' | 'thinking' | 'drafting' | 'escalated' | 'completed';

export interface AiSessionState {
  conversationId: string;
  status: AiSessionStatus;
  workflowStep?: string;
}

export interface AiEscalation {
  id: string;
  conversationId: string;
  reason: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}

export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowExecutionStepLog {
  id: string;
  title: string;
  status: WorkflowExecutionStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowExecutionStatus;
  triggeredAt: string;
  conversationId?: string;
  ticketId?: string;
  steps: WorkflowExecutionStepLog[];
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category?: string;
}

export interface AgentProfile {
  id: string;
  userId: string;
  teamIds: string[];
  /** Shares @easydev/types' PresenceStatus vocabulary (ONLINE/AWAY/BUSY/OFFLINE) - the
   * same one the availability and realtime-presence APIs use. */
  presenceStatus: PresenceStatusValue;
  maxConcurrentConversations: number;
}
