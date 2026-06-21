export type ConversationStatusValue = 'OPEN' | 'PENDING' | 'SNOOZED' | 'RESOLVED' | 'CLOSED';

export type ConversationPriorityValue = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type MessageSenderType = 'CUSTOMER' | 'AGENT' | 'AI' | 'SYSTEM';

export type MessageDeliveryState = 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface ConversationParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ConversationSummary {
  id: string;
  subject?: string;
  previewText: string;
  status: ConversationStatusValue;
  priority: ConversationPriorityValue;
  customer: ConversationParticipant;
  assignee?: ConversationParticipant;
  unreadCount: number;
  lastMessageAt: string;
  channel: string;
  tags?: string[];
}

export interface AttachmentMeta {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  uploadProgress?: number;
  uploadError?: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  senderName: string;
  senderAvatarUrl?: string;
  content: string;
  isInternalNote: boolean;
  attachments: AttachmentMeta[];
  deliveryState: MessageDeliveryState;
  createdAt: string;
}

export interface TimelineEntry {
  id: string;
  label: string;
  description?: string;
  actorName?: string;
  timestamp: string;
  icon?: 'status' | 'assignment' | 'note' | 'ai' | 'system' | 'sla';
}
