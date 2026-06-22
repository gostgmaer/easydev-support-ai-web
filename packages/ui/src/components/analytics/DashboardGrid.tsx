import * as React from 'react';
import { cn } from '../../utils';

export interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
}

export function DashboardGrid({ columns = 4, className, ...props }: DashboardGridProps) {
  const colsClassName = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return <div className={cn('grid gap-4', colsClassName, className)} {...props} />;
}

export interface DashboardGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4;
}

export function DashboardGridItem({ span = 1, className, ...props }: DashboardGridItemProps) {
  const spanClassName = {
    1: '',
    2: 'sm:col-span-2',
    3: 'lg:col-span-3',
    4: 'lg:col-span-4',
  }[span];

  return <div className={cn(spanClassName, className)} {...props} />;
}
