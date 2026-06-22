import * as React from 'react';
import { cn } from '../../utils';

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Panel({ title, icon, actions, className, children, ...props }: PanelProps) {
  return (
    <div className={cn('flex h-full flex-col border-l border-border bg-background', className)} {...props}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            {icon}
            {title}
          </div>
          {actions}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
