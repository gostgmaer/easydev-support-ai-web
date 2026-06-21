import * as React from 'react';
import { DateFilter, type DateFilterProps } from './DateFilter';
import { AdvancedFilters, type AdvancedFiltersProps } from '../data/AdvancedFilters';
import { cn } from '../../utils';

export interface AnalyticsFiltersProps {
  dateFilter: DateFilterProps;
  advancedFilters: AdvancedFiltersProps;
  className?: string;
}

export function AnalyticsFilters({ dateFilter, advancedFilters, className }: AnalyticsFiltersProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <DateFilter {...dateFilter} />
      <AdvancedFilters {...advancedFilters} />
    </div>
  );
}
