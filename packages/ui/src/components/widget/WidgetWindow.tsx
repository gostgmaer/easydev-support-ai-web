import * as React from 'react';
import type { WidgetPosition } from '../../types/widget';
import { cn } from '../../utils';

export interface WidgetWindowProps {
  open: boolean;
  position?: WidgetPosition;
  header: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
  height?: number;
  className?: string;
}

export function WidgetWindow({ open, position = 'bottom-right', header, footer, children, width = 368, height = 560, className }: WidgetWindowProps) {
  return (
    <div
      role="dialog"
      aria-hidden={!open}
      style={{ width, height }}
      className={cn(
        'fixed z-modal flex flex-col overflow-hidden rounded-lg bg-background shadow-modal transition-all duration-200',
        position === 'bottom-right' ? 'bottom-24 right-5' : 'bottom-24 left-5',
        open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        className,
      )}
    >
      {header}
      <div className="flex-1 overflow-y-auto">{children}</div>
      {footer}
    </div>
  );
}
