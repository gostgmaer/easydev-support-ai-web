import * as React from 'react';
import type { ConnectorLogEntry } from '../../types/connector';
import { formatDate } from '../../utils';
import { cn } from '../../utils';

const LEVEL_CLASSNAME: Record<ConnectorLogEntry['level'], string> = {
  info: 'text-muted-foreground',
  warn: 'text-warning',
  error: 'text-danger',
};

export interface ConnectorLogsViewerProps {
  logs: ConnectorLogEntry[];
  className?: string;
}

export function ConnectorLogsViewer({ logs, className }: ConnectorLogsViewerProps) {
  return (
    <div className={cn('max-h-80 overflow-y-auto rounded-md bg-neutral-900 p-3 font-mono text-xs', className)}>
      {logs.map((log) => (
        <div key={log.id} className="flex gap-2 py-0.5">
          <span className="shrink-0 text-neutral-500">{formatDate(log.timestamp)}</span>
          <span className={cn('shrink-0 uppercase', LEVEL_CLASSNAME[log.level])}>[{log.level}]</span>
          <span className="text-neutral-200">{log.message}</span>
        </div>
      ))}
    </div>
  );
}
