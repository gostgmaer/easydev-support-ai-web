import * as React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent } from '../layout/Card';
import type { TrendInfo } from '../../types/analytics';
import { cn } from '../../utils';

export interface TrendCardProps {
  label: string;
  value: string | number;
  trend: TrendInfo;
  series?: number[];
  className?: string;
}

export function TrendCard({ label, value, trend, series, className }: TrendCardProps) {
  const max = series && series.length > 0 ? Math.max(...series, 1) : 1;

  return (
    <Card className={className}>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-1.5 flex items-end justify-between gap-3">
          <div>
            <span className="text-2xl font-bold text-foreground">{value}</span>
            <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', trend.isPositive ? 'text-success' : 'text-danger')}>
              {trend.direction === 'up' && <ArrowUp className="h-3 w-3" />}
              {trend.direction === 'down' && <ArrowDown className="h-3 w-3" />}
              {trend.direction === 'flat' && <Minus className="h-3 w-3" />}
              {trend.changePercent.toFixed(1)}%
            </p>
          </div>
          {series && series.length > 0 && (
            <div className="flex h-10 items-end gap-0.5" aria-hidden="true">
              {series.map((point, index) => (
                <span
                  key={index}
                  className={cn('w-1.5 rounded-sm', trend.isPositive ? 'bg-success/60' : 'bg-danger/60')}
                  style={{ height: `${Math.max(8, (point / max) * 100)}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
