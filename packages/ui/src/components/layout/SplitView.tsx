import * as React from 'react';
import { cn } from '../../utils';

export interface SplitViewProps extends React.HTMLAttributes<HTMLDivElement> {
  start: React.ReactNode;
  end: React.ReactNode;
  startWidth?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function SplitView({ start, end, startWidth = '320px', orientation = 'horizontal', className, ...props }: SplitViewProps) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <div className={cn('flex h-full w-full', isHorizontal ? 'flex-row' : 'flex-col', className)} {...props}>
      <div
        className={cn('shrink-0 overflow-y-auto', isHorizontal ? 'border-r border-border' : 'border-b border-border')}
        style={isHorizontal ? { width: startWidth } : { height: startWidth }}
      >
        {start}
      </div>
      <div className="flex-1 overflow-y-auto">{end}</div>
    </div>
  );
}
