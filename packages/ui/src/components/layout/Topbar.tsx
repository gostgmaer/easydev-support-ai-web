import * as React from 'react';
import { cn } from '../../utils';

export interface TopbarProps extends React.HTMLAttributes<HTMLDivElement> {
  start?: React.ReactNode;
  center?: React.ReactNode;
  end?: React.ReactNode;
}

export function Topbar({ start, center, end, className, ...props }: TopbarProps) {
  return (
    <header
      className={cn('flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4', className)}
      {...props}
    >
      <div className="flex items-center gap-2">{start}</div>
      <div className="flex-1">{center}</div>
      <div className="flex items-center gap-2">{end}</div>
    </header>
  );
}
