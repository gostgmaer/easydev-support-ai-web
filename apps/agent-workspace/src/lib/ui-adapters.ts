import type {
  AiApprovalRequest,
  AiToolCall,
  ConversationPriorityValue,
  ConversationStatusValue,
  ConversationSummary,
  CustomerProfile,
  KnowledgeArticleSummary,
  MessageDeliveryState,
  MessageItem,
  MessageSenderType,
  TicketDetails,
  WorkflowExecutionStep,
} from '@easydev/ui';
import type { NotificationCategory, NotificationItem } from '@easydev/types';
import type {
  AiEscalation,
  Conversation,
  ConversationPriority,
  ConversationStatus,
  Customer,
  KnowledgeArticle,
  Message,
  Notification,
  Ticket,
  TicketStatus,
  ToolCall,
  WorkflowExecutionStepLog,
} from '../types';

/**
 * @easydev/ui ships its own view-model types for inbox components (ConversationSummary,
 * MessageItem, ...), separate from this app's own domain types (Conversation, Message),
 * which are themselves already normalized from the backend's enums (see lib/normalize.ts).
 * These adapters are the final hop: local domain type -> the shared library's view-model.
 */

const PRIORITY_TO_UI: Record<ConversationPriority, ConversationPriorityValue> = {
  low: 'LOW',
  medium: 'NORMAL',
  high: 'HIGH',
  urgent: 'URGENT',
};

const STATUS_TO_UI: Record<ConversationStatus, ConversationStatusValue> = {
  open: 'OPEN',
  snoozed: 'SNOOZED',
  resolved: 'RESOLVED',
  // No direct equivalent for "escalated" in the library's status union - it stays open,
  // urgency is already conveyed separately via priority.
  escalated: 'OPEN',
};

export function toConversationSummary(conversation: Conversation): ConversationSummary {
  return {
    id: conversation.id,
    subject: conversation.subject,
    previewText: conversation.lastMessage ?? '',
    status: STATUS_TO_UI[conversation.status],
    priority: PRIORITY_TO_UI[conversation.priority],
    customer: {
      id: conversation.customerId,
      name: conversation.customerName,
      avatarUrl: conversation.customerAvatar,
    },
    // No agent directory lookup is wired yet - falls back to showing the raw id as the name.
    assignee: conversation.assignedAgentId
      ? { id: conversation.assignedAgentId, name: conversation.assignedAgentId }
      : undefined,
    unreadCount: conversation.unreadCount,
    lastMessageAt: conversation.updatedAt,
    channel: 'chat',
    tags: [],
  };
}

const SENDER_TYPE_TO_UI: Record<Message['senderType'], MessageSenderType> = {
  customer: 'CUSTOMER',
  agent: 'AGENT',
  ai: 'AI',
  system: 'SYSTEM',
};

function deliveryStateFor(message: Message): MessageDeliveryState {
  if (message.status === 'failed') return 'FAILED';
  if (message.id.startsWith('temp-')) return 'SENDING';
  if (message.readReceipts && message.readReceipts.length > 0) return 'READ';
  return 'DELIVERED';
}

export function toCustomerProfile(
  customer: Customer,
  ticketCounts?: { open: number; total: number },
): CustomerProfile {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    avatarUrl: customer.avatar,
    tags: customer.tags,
    openTicketCount: ticketCounts?.open,
    totalTicketCount: ticketCounts?.total,
  };
}

const TICKET_STATUS_TO_UI: Record<TicketStatus, ConversationStatusValue> = {
  open: 'OPEN',
  pending: 'PENDING',
  solved: 'RESOLVED',
  closed: 'CLOSED',
};

export function toTicketDetails(ticket: Ticket): TicketDetails {
  return {
    id: ticket.id,
    number: ticket.id,
    status: TICKET_STATUS_TO_UI[ticket.status],
    priority: PRIORITY_TO_UI[ticket.priority],
    // No agent directory lookup is wired yet - falls back to showing the raw id as the name.
    assigneeName: ticket.assignedAgentId,
    tags: [],
  };
}

const TOOL_CALL_STATUS_TO_UI: Record<ToolCall['status'], AiToolCall['status']> = {
  pending: 'PENDING',
  success: 'SUCCEEDED',
  failed: 'FAILED',
};

/** The local ToolCall shape (pushed via the ai:draft_suggested socket event) doesn't carry
 * an id or timing, since the backend hasn't been observed to send them - synthesized here. */
export function toAiToolCall(toolCall: ToolCall, index: number): AiToolCall {
  return {
    id: `tool-call-${index}`,
    toolName: toolCall.name,
    status: TOOL_CALL_STATUS_TO_UI[toolCall.status],
    input: toolCall.arguments,
    output: toolCall.result ? { result: toolCall.result } : undefined,
    startedAt: new Date().toISOString(),
  };
}

export function toAiApprovalRequest(escalation: AiEscalation): AiApprovalRequest {
  return {
    id: escalation.id,
    summary: escalation.reason,
    confidence: 0,
    requestedAt: escalation.createdAt,
  };
}

/** Knowledge search results have no document-status concept locally - surfaced search
 * results are always published content, so this is a safe constant default. */
export function toKnowledgeArticleSummary(article: KnowledgeArticle): KnowledgeArticleSummary {
  return {
    id: article.id,
    title: article.title,
    excerpt: article.content.slice(0, 160),
    status: 'PUBLISHED',
    categoryName: article.category,
    updatedAt: new Date().toISOString(),
  };
}

export function toWorkflowExecutionStep(step: WorkflowExecutionStepLog): WorkflowExecutionStep {
  return {
    id: step.id,
    nodeId: step.id,
    nodeTitle: step.title,
    status: step.status,
    startedAt: step.startedAt ?? new Date().toISOString(),
    completedAt: step.completedAt,
    errorMessage: step.error,
  };
}

const NOTIFICATION_TYPE_TO_CATEGORY: Record<Notification['type'], NotificationCategory> = {
  mention: 'CONVERSATION',
  assignment: 'CONVERSATION',
  sla_risk: 'TICKET',
  escalation: 'AI',
};

export function toNotificationItem(notification: Notification): NotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.description,
    category: NOTIFICATION_TYPE_TO_CATEGORY[notification.type],
    link: notification.referenceId,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}

export function toMessageItem(message: Message): MessageItem {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderType: SENDER_TYPE_TO_UI[message.senderType],
    senderName: message.senderName,
    senderAvatarUrl: message.senderAvatar,
    content: message.content,
    isInternalNote: message.isInternalNote,
    attachments: (message.attachments ?? []).map((a, index) => ({
      id: `${message.id}-attachment-${index}`,
      name: a.name,
      mimeType: a.type,
      sizeBytes: a.size,
      url: a.url,
    })),
    deliveryState: deliveryStateFor(message),
    createdAt: message.createdAt,
  };
}
