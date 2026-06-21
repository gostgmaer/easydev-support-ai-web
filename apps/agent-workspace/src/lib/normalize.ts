import type { Conversation, ConversationPriority, ConversationStatus, Ticket, TicketStatus } from '../types';

/**
 * The backend domain uses a richer, uppercase enum vocabulary than this app's
 * simplified local UI unions (ConversationStatus/ConversationPriority/TicketStatus).
 * These adapters live at the API boundary so the rest of the UI can keep
 * pattern-matching the small local vocabulary while real backend data is
 * normalized on the way in (and translated back on the way out).
 */

const PRIORITY_FROM_BACKEND: Record<string, ConversationPriority> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'urgent',
};

const PRIORITY_TO_BACKEND: Record<ConversationPriority, string> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  urgent: 'URGENT',
};

export function normalizePriority(raw: string): ConversationPriority {
  return PRIORITY_FROM_BACKEND[raw] ?? 'medium';
}

export function priorityToBackend(priority: ConversationPriority): string {
  return PRIORITY_TO_BACKEND[priority];
}

// Backend ConversationStatusEnum: OPEN/PENDING/ASSIGNED/WAITING_CUSTOMER/WAITING_AGENT/RESOLVED/CLOSED/ARCHIVED.
// Local ConversationStatus only distinguishes open/snoozed/resolved - WAITING_AGENT is the
// closest real status to "snoozed" (an agent parked it for later); the rest collapse sensibly.
const CONVERSATION_STATUS_FROM_BACKEND: Record<string, ConversationStatus> = {
  OPEN: 'open',
  PENDING: 'open',
  ASSIGNED: 'open',
  WAITING_CUSTOMER: 'open',
  WAITING_AGENT: 'snoozed',
  RESOLVED: 'resolved',
  CLOSED: 'resolved',
  ARCHIVED: 'resolved',
};

export function normalizeConversationStatus(raw: string): ConversationStatus {
  return CONVERSATION_STATUS_FROM_BACKEND[raw] ?? 'open';
}

// Backend TicketStatusEnum: OPEN/ASSIGNED/IN_PROGRESS/WAITING_CUSTOMER/WAITING_INTERNAL/
// APPROVAL_PENDING/RESOLVED/CLOSED/REOPENED/CANCELLED. Local TicketStatus is open/pending/solved/closed.
const TICKET_STATUS_FROM_BACKEND: Record<string, TicketStatus> = {
  OPEN: 'open',
  ASSIGNED: 'open',
  IN_PROGRESS: 'open',
  REOPENED: 'open',
  WAITING_CUSTOMER: 'pending',
  WAITING_INTERNAL: 'pending',
  APPROVAL_PENDING: 'pending',
  RESOLVED: 'solved',
  CLOSED: 'closed',
  CANCELLED: 'closed',
};

const TICKET_STATUS_TO_BACKEND: Record<TicketStatus, string> = {
  open: 'OPEN',
  pending: 'WAITING_CUSTOMER',
  solved: 'RESOLVED',
  closed: 'CLOSED',
};

export function normalizeTicketStatus(raw: string): TicketStatus {
  return TICKET_STATUS_FROM_BACKEND[raw] ?? 'open';
}

export function ticketStatusToBackend(status: TicketStatus): string {
  return TICKET_STATUS_TO_BACKEND[status];
}

/** Normalizes a raw conversation payload from the API into this app's local shape. */
export function normalizeConversation(raw: Record<string, unknown>): Conversation {
  return {
    ...(raw as unknown as Conversation),
    status: normalizeConversationStatus(String(raw.status ?? '')),
    priority: normalizePriority(String(raw.priority ?? '')),
  };
}

/** Normalizes a raw ticket payload from the API into this app's local shape. */
export function normalizeTicket(raw: Record<string, unknown>): Ticket {
  return {
    ...(raw as unknown as Ticket),
    status: normalizeTicketStatus(String(raw.status ?? '')),
    priority: normalizePriority(String(raw.priority ?? '')),
  };
}
