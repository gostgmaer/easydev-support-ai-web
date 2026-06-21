import * as React from 'react';
import type { PresenceStatus } from '@easydev/types';
import { cn } from '../../utils';

const PRESENCE_CONFIG: Record<PresenceStatus, { label: string; dotClassName: string }> = {
  ONLINE: { label: 'Online', dotClassName: 'bg-success' },
  AWAY: { label: 'Away', dotClassName: 'bg-warning' },
  BUSY: { label: 'Busy', dotClassName: 'bg-danger' },
  OFFLINE: { label: 'Offline', dotClassName: 'bg-neutral-400' },
};

export interface PresenceIndicatorProps {
  status: PresenceStatus;
  showLabel?: boolean;
  className?: string;
}

export function PresenceIndicator({ status, showLabel = true, className }: PresenceIndicatorProps) {
  const config = PRESENCE_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', config.dotClassName)} />
      {showLabel && config.label}
    </span>
  );
}
