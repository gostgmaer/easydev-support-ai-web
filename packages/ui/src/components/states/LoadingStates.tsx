import * as React from 'react';
import { Skeleton } from '../base/Skeleton';
import { cn } from '../../utils';

export interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableLoading({ rows = 6, columns = 5, className }: TableLoadingProps) {
  return (
    <div className={cn('overflow-hidden rounded-md border border-border', className)}>
      <div className="flex border-b border-border bg-muted/50 px-3 py-2.5">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="mr-4 h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 border-b border-border px-3 py-3 last:border-0">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton key={columnIndex} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function InboxLoading({ items = 6, className }: { items?: number; className?: string }) {
  return (
    <div className={cn('divide-y divide-border', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 px-3 py-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={cn('flex gap-2.5', index % 2 === 1 && 'flex-row-reverse')}>
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <Skeleton className={cn('h-10 rounded-lg', index % 2 === 1 ? 'w-1/3' : 'w-1/2')} />
        </div>
      ))}
    </div>
  );
}

export function DashboardLoading({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-border p-5">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function ChartLoading({ height = 240, className }: { height?: number; className?: string }) {
  return <Skeleton className={cn('w-full rounded-md', className)} style={{ height }} />;
}

export function WidgetLoading({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 p-4', className)}>
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-10 w-3/4 rounded-lg" />
      <Skeleton className="ml-auto h-10 w-2/3 rounded-lg" />
    </div>
  );
}
