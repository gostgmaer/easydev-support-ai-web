import * as React from 'react';
import { cn } from '../../utils';

export interface RealtimeBadgeProps {
  label?: string;
  className?: string;
}

export function RealtimeBadge({ label = 'Live', className }: RealtimeBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger', className)}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
      </span>
      {label}
    </span>
  );
}
