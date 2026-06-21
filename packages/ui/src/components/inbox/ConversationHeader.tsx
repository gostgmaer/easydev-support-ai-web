import * as React from 'react';
import { Avatar } from '../base/Avatar';
import { ConversationStatus } from './ConversationStatus';
import { ConversationPriority } from './ConversationPriority';
import { PresenceIndicator } from './PresenceIndicator';
import type { ConversationSummary } from '../../types/inbox';
import type { PresenceStatus } from '@easydev/types';
import { cn } from '../../utils';

export interface ConversationHeaderProps {
  conversation: ConversationSummary;
  customerPresence?: PresenceStatus;
  actions?: React.ReactNode;
  className?: string;
}

export function ConversationHeader({ conversation, customerPresence, actions, className }: ConversationHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 border-b border-border px-4 py-3', className)}>
      <div className="flex items-center gap-3">
        <Avatar name={conversation.customer.name} src={conversation.customer.avatarUrl} size="md" />
        <div>
          <p className="text-sm font-semibold text-foreground">{conversation.customer.name}</p>
          {customerPresence && <PresenceIndicator status={customerPresence} />}
        </div>
        <div className="ml-2 flex items-center gap-1.5">
          <ConversationStatus status={conversation.status} />
          <ConversationPriority priority={conversation.priority} />
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
