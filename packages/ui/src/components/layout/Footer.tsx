import * as React from 'react';
import { cn } from '../../utils';

export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  start?: React.ReactNode;
  end?: React.ReactNode;
}

export function Footer({ start, end, className, ...props }: FooterProps) {
  return (
    <footer
      className={cn(
        'flex h-12 shrink-0 items-center justify-between border-t border-border bg-background px-4 text-xs text-muted-foreground',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">{start}</div>
      <div className="flex items-center gap-2">{end}</div>
    </footer>
  );
}
