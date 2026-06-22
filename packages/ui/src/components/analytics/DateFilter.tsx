import * as React from 'react';
import { DateRangePicker } from '../base/DateRangePicker';
import { cn } from '../../utils';
import type { DateRangePreset, DateRangeValue } from '../../types/analytics';

const PRESETS: Array<{ value: DateRangePreset; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'mtd', label: 'MTD' },
  { value: 'qtd', label: 'QTD' },
  { value: 'ytd', label: 'YTD' },
];

export interface DateFilterProps {
  preset: DateRangePreset;
  range?: DateRangeValue;
  onPresetChange: (preset: DateRangePreset) => void;
  onRangeChange: (range: DateRangeValue | undefined) => void;
  className?: string;
}

export function DateFilter({ preset, range, onPresetChange, onRangeChange, className }: DateFilterProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {PRESETS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onPresetChange(option.value)}
          className={cn(
            'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
            preset === option.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPresetChange('custom')}
        className={cn(
          'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
          preset === 'custom' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        Custom
      </button>
      {preset === 'custom' && (
        <DateRangePicker
          value={range ? { from: range.from, to: range.to } : undefined}
          onValueChange={(value) => onRangeChange(value?.from && value.to ? { from: value.from, to: value.to } : undefined)}
          className="w-56"
        />
      )}
    </div>
  );
}
