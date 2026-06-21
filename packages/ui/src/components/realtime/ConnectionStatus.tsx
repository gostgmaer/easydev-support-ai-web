import * as React from 'react';
import { Wifi, WifiOff, RefreshCw, CloudOff } from 'lucide-react';
import type { ConnectionStatus as ConnectionStatusValue } from '@easydev/types';
import { cn } from '../../utils';

const STATUS_CONFIG: Record<ConnectionStatusValue, { label: string; icon: React.ComponentType<{ className?: string }>; className: string; spin?: boolean }> = {
  CONNECTED: { label: 'Connected', icon: Wifi, className: 'text-success' },
  CONNECTING: { label: 'Connecting…', icon: RefreshCw, className: 'text-info', spin: true },
  RECONNECTING: { label: 'Reconnecting…', icon: RefreshCw, className: 'text-warning', spin: true },
  DISCONNECTED: { label: 'Disconnected', icon: WifiOff, className: 'text-danger' },
  // Distinct from DISCONNECTED: the OS reports no network at all, so reconnect
  // attempts are paused rather than spinning indefinitely until it comes back.
  OFFLINE: { label: 'Offline', icon: CloudOff, className: 'text-neutral-400' },
};

export interface ConnectionStatusProps {
  status: ConnectionStatusValue;
  showLabel?: boolean;
  className?: string;
}

export function ConnectionStatus({ status, showLabel = true, className }: ConnectionStatusProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', config.className, className)}>
      <Icon className={cn('h-3.5 w-3.5', config.spin && 'animate-spin')} aria-hidden="true" />
      {showLabel && config.label}
    </span>
  );
}
