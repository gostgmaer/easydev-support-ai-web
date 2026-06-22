import * as React from 'react';
import { cn } from '../../utils';

export interface ActivityIndicatorProps {
  label: string;
  active?: boolean;
  className?: string;
}

export function ActivityIndicator({ label, active = true, className }: ActivityIndicatorProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'animate-pulse bg-info' : 'bg-neutral-400')} />
      {label}
    </span>
  );
}
