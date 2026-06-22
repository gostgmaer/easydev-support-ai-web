import * as React from 'react';
import { Bot, Settings } from 'lucide-react';
import { Avatar } from '../base/Avatar';
import { AttachmentViewer } from './AttachmentViewer';
import { ReadReceipt } from './ReadReceipt';
import type { MessageItem } from '../../types/inbox';
import { formatRelativeTime } from '../../utils';
import { cn } from '../../utils';

export interface MessageBubbleProps {
  message: MessageItem;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isOutgoing = message.senderType === 'AGENT' || message.senderType === 'AI';
  const isSystem = message.senderType === 'SYSTEM';

  if (isSystem) {
    return (
      <div className="flex items-center justify-center gap-2 py-1 text-xs text-muted-foreground">
        <Settings className="h-3.5 w-3.5" />
        {message.content}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2.5', isOutgoing && 'flex-row-reverse')}>
      {message.senderType === 'AI' ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </span>
      ) : (
        <Avatar name={message.senderName} src={message.senderAvatarUrl} size="sm" />
      )}
      <div className={cn('flex max-w-[70%] flex-col gap-1', isOutgoing && 'items-end')}>
        <span className="text-xs font-medium text-muted-foreground">{message.senderName}</span>
        <div
          className={cn(
            'rounded-lg px-3 py-2 text-sm',
            message.isInternalNote
              ? 'border border-warning/30 bg-warning/10 text-foreground'
              : isOutgoing
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground',
          )}
        >
          {message.isInternalNote && <span className="mb-1 block text-xs font-semibold uppercase tracking-wide opacity-70">Internal note</span>}
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <AttachmentViewer key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{formatRelativeTime(message.createdAt)}</span>
          {isOutgoing && <ReadReceipt state={message.deliveryState} />}
        </div>
      </div>
    </div>
  );
}
