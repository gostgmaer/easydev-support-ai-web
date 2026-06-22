import * as React from 'react';
import { Bell, Check, MessageSquare, Ticket, Workflow, Bot, Settings } from 'lucide-react';
import type { NotificationItem, NotificationCategory } from '@easydev/types';
import { formatRelativeTime } from '../../utils';
import { cn } from '../../utils';

const CATEGORY_ICON: Record<NotificationCategory, React.ComponentType<{ className?: string }>> = {
  TICKET: Ticket,
  CONVERSATION: MessageSquare,
  WORKFLOW: Workflow,
  AI: Bot,
  SYSTEM: Settings,
};

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

export function NotificationCenter({ notifications, onMarkAsRead, onMarkAllAsRead, onNotificationClick, emptyState, className }: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Bell className="h-4 w-4" />
          Notifications
        </span>
        {unreadCount > 0 && (
          <button type="button" onClick={onMarkAllAsRead} className="text-xs font-medium text-primary hover:underline">
            Mark all as read
          </button>
        )}
      </div>
      {notifications.length === 0 && emptyState ? (
        emptyState
      ) : (
        <ul className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = CATEGORY_ICON[notification.category];
            return (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => {
                    onNotificationClick?.(notification);
                    if (!notification.read) onMarkAsRead(notification.id);
                  }}
                  className={cn('flex w-full items-start gap-2.5 border-b border-border px-3 py-2.5 text-left hover:bg-muted', !notification.read && 'bg-primary/5')}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className={cn('text-sm', notification.read ? 'text-foreground' : 'font-semibold text-foreground')}>{notification.title}</p>
                    {notification.body && <p className="mt-0.5 text-xs text-muted-foreground">{notification.body}</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
                  </div>
                  {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  {notification.read && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
