import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { AiConfidenceBadge } from './AiConfidenceBadge';
import { AiCostBadge } from './AiCostBadge';
import type { AiActivityEvent } from '../../types/ai';
import { formatRelativeTime } from '../../utils';
import { cn } from '../../utils';

export interface AiActivityTimelineProps {
  events: AiActivityEvent[];
  className?: string;
}

export function AiActivityTimeline({ events, className }: AiActivityTimelineProps) {
  return (
    <ol className={cn('space-y-3', className)}>
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-foreground">{event.label}</p>
              <span className="flex shrink-0 items-center gap-1.5">
                {event.confidence !== undefined && <AiConfidenceBadge score={event.confidence} />}
                {event.cost !== undefined && <AiCostBadge cost={event.cost} />}
              </span>
            </div>
            {event.description && <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>}
            <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(event.timestamp)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
