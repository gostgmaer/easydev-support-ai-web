import * as React from 'react';
import { Avatar } from '../base/Avatar';
import type { TimelineEntry } from '../../types/inbox';
import { formatRelativeTime } from '../../utils';
import { cn } from '../../utils';

export interface ActivityFeedProps {
  entries: TimelineEntry[];
  className?: string;
}

export function ActivityFeed({ entries, className }: ActivityFeedProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-3">
          <Avatar name={entry.actorName ?? 'System'} size="sm" />
          <div className="flex-1">
            <p className="text-sm text-foreground">
              {entry.actorName && <span className="font-medium">{entry.actorName} </span>}
              {entry.label}
            </p>
            {entry.description && <p className="mt-0.5 text-sm text-muted-foreground">{entry.description}</p>}
            <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(entry.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
