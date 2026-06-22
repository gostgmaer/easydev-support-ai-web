import * as React from 'react';
import { Card, CardContent } from '../layout/Card';
import { Progress } from '../base/Progress';
import { cn } from '../../utils';

export interface KpiCardProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({ label, value, target, unit, icon, className }: KpiCardProps) {
  const percent = target > 0 ? Math.min(100, (value / target) * 100) : 0;

  return (
    <Card className={className}>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          <span className="text-xs text-muted-foreground">/ {target} target</span>
        </div>
        <Progress value={percent} className={cn(percent >= 100 && '[&>div]:bg-success')} />
      </CardContent>
    </Card>
  );
}
