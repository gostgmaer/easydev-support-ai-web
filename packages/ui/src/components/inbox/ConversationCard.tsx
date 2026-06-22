import * as React from 'react';
import { Avatar } from '../base/Avatar';
import { Badge } from '../base/Badge';
import { ConversationPriority } from './ConversationPriority';
import type { ConversationSummary } from '../../types/inbox';
import { formatRelativeTime } from '../../utils';
import { cn } from '../../utils';

export interface ConversationCardProps {
  conversation: ConversationSummary;
  selected?: boolean;
  onClick?: () => void;
}

export function ConversationCard({ conversation, selected = false, onClick }: ConversationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left transition-colors',
        selected ? 'bg-primary/5' : 'hover:bg-muted/60',
      )}
    >
      <Avatar name={conversation.customer.name} src={conversation.customer.avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-sm', conversation.unreadCount > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground')}>
            {conversation.customer.name}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(conversation.lastMessageAt)}</span>
        </div>
        {conversation.subject && <p className="truncate text-xs font-medium text-muted-foreground">{conversation.subject}</p>}
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{conversation.previewText}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <ConversationPriority priority={conversation.priority} />
          <Badge tone="neutral">{conversation.channel}</Badge>
          {conversation.unreadCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
