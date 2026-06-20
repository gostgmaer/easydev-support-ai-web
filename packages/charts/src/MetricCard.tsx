import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  changePercent?: number; // e.g. 12 (represents +12%) or -5 (represents -5%)
  changeLabel?: string; // e.g. "vs last week"
}

export function MetricCard({ title, value, changePercent, changeLabel }: MetricCardProps) {
  const isPositive = changePercent !== undefined && changePercent >= 0;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      {/* Title */}
      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
        {title}
      </span>

      {/* Main Value */}
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-neutral-900">{value}</span>
        
        {/* Trend Indicator */}
        {changePercent !== undefined && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-semibold rounded px-1.5 py-0.5 ${
              isPositive
                ? 'bg-success/10 text-success'
                : 'bg-danger/10 text-danger'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {changePercent}%
            </span>
          </div>
        )}
      </div>

      {/* Compare label */}
      {changeLabel && (
        <span className="text-xs text-neutral-500 mt-2 block font-medium">
          {changeLabel}
        </span>
      )}
    </div>
  );
}
