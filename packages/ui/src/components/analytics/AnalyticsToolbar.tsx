import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { AnalyticsFilters, type AnalyticsFiltersProps } from './AnalyticsFilters';
import { IconButton } from '../base/IconButton';
import { cn } from '../../utils';

export interface AnalyticsToolbarProps extends AnalyticsFiltersProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function AnalyticsToolbar({ onRefresh, isRefreshing = false, actions, className, ...filterProps }: AnalyticsToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <AnalyticsFilters {...filterProps} />
      <div className="flex items-center gap-2">
        {actions}
        {onRefresh && (
          <IconButton
            icon={<RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />}
            label="Refresh"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          />
        )}
      </div>
    </div>
  );
}
