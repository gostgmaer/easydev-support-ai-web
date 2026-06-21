import * as React from 'react';
import { cn } from '../../utils';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  topbar?: React.ReactNode;
  footer?: React.ReactNode;
}

export function AppShell({ sidebar, topbar, footer, className, children, ...props }: AppShellProps) {
  return (
    <div className={cn('flex h-screen w-full overflow-hidden bg-background', className)} {...props}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {topbar}
        <main className="flex-1 overflow-y-auto">{children}</main>
        {footer}
      </div>
    </div>
  );
}
