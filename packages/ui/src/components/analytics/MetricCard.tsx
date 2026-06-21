import * as React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '../layout/Card';
import type { MetricDatum } from '../../types/analytics';
import { cn } from '../../utils';

export interface MetricCardProps {
  metric: MetricDatum;
  className?: string;
}

export function MetricCard({ metric, className }: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{metric.label}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{metric.value}</span>
          {metric.unit && <span className="text-sm text-muted-foreground">{metric.unit}</span>}
        </div>
        {metric.trend && (
          <p
            className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              metric.trend.isPositive ? 'text-success' : 'text-danger',
            )}
          >
            {metric.trend.direction === 'up' && <ArrowUp className="h-3 w-3" />}
            {metric.trend.direction === 'down' && <ArrowDown className="h-3 w-3" />}
            {metric.trend.changePercent.toFixed(1)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
