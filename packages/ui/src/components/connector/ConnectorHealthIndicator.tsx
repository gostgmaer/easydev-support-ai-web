import * as React from 'react';
import type { ConnectorHealthStatus } from '../../types/connector';
import { cn } from '../../utils';

const HEALTH_CONFIG: Record<ConnectorHealthStatus, { label: string; dotClassName: string }> = {
  HEALTHY: { label: 'Healthy', dotClassName: 'bg-success' },
  DEGRADED: { label: 'Degraded', dotClassName: 'bg-warning' },
  DOWN: { label: 'Down', dotClassName: 'bg-danger' },
  UNCONFIGURED: { label: 'Not configured', dotClassName: 'bg-neutral-400' },
};

export interface ConnectorHealthIndicatorProps {
  health: ConnectorHealthStatus;
  className?: string;
}

export function ConnectorHealthIndicator({ health, className }: ConnectorHealthIndicatorProps) {
  const config = HEALTH_CONFIG[health];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground', className)}>
      <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', config.dotClassName)} />
      {config.label}
    </span>
  );
}
