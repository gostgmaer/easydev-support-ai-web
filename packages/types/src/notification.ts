export type NotificationCategory = 'TICKET' | 'CONVERSATION' | 'WORKFLOW' | 'AI' | 'SYSTEM';

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  category: NotificationCategory;
  link?: string;
  read: boolean;
  createdAt: string;
}
