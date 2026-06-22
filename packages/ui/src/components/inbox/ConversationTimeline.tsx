import * as React from 'react';
import { UserCog, MessageSquare, Bot, RefreshCw, Clock } from 'lucide-react';
import type { TimelineEntry } from '../../types/inbox';
import { formatRelativeTime } from '../../utils';
import { cn } from '../../utils';

const ICON_MAP: Record<NonNullable<TimelineEntry['icon']>, React.ComponentType<{ className?: string }>> = {
  status: RefreshCw,
  assignment: UserCog,
  note: MessageSquare,
  ai: Bot,
  system: Clock,
  sla: Clock,
};

export interface ConversationTimelineProps {
  entries: TimelineEntry[];
  className?: string;
}

export function ConversationTimeline({ entries, className }: ConversationTimelineProps) {
  return (
    <ol className={cn('space-y-3', className)}>
      {entries.map((entry) => {
        const Icon = ICON_MAP[entry.icon ?? 'system'];
        return (
          <li key={entry.id} className="flex items-start gap-2.5 text-sm">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-foreground">
                {entry.actorName && <span className="font-medium">{entry.actorName} </span>}
                {entry.label}
              </p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(entry.timestamp)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
