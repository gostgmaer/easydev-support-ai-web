import * as React from 'react';
import { FileEdit, UserCog, MessageSquare, Bot, Settings, Clock } from 'lucide-react';
import type { TimelineEntry } from '../../types/inbox';
import { formatDate } from '../../utils';
import { cn } from '../../utils';

const ICON_MAP: Record<NonNullable<TimelineEntry['icon']>, React.ComponentType<{ className?: string }>> = {
  status: FileEdit,
  assignment: UserCog,
  note: MessageSquare,
  ai: Bot,
  system: Settings,
  sla: Clock,
};

export interface AuditTimelineProps {
  entries: TimelineEntry[];
  className?: string;
}

export function AuditTimeline({ entries, className }: AuditTimelineProps) {
  return (
    <ol className={cn('space-y-0', className)}>
      {entries.map((entry, index) => {
        const Icon = ICON_MAP[entry.icon ?? 'system'];
        return (
          <li key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
            {index < entries.length - 1 && (
              <span aria-hidden="true" className="absolute left-3 top-7 h-full w-px bg-border" />
            )}
            <span className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-foreground">
                {entry.actorName && <span className="font-medium">{entry.actorName} </span>}
                {entry.label}
              </p>
              {entry.description && <p className="mt-0.5 text-xs text-muted-foreground">{entry.description}</p>}
              <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
