import * as React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { focusRingClassName } from '@easydev/design-system';
import type { WidgetPosition } from '../../types/widget';
import { cn } from '../../utils';

export interface WidgetLauncherProps {
  open: boolean;
  onToggle: () => void;
  position?: WidgetPosition;
  unreadCount?: number;
  className?: string;
}

export function WidgetLauncher({ open, onToggle, position = 'bottom-right', unreadCount = 0, className }: WidgetLauncherProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? 'Close chat' : 'Open chat'}
      className={cn(
        'fixed z-modal flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-floating transition-transform hover:scale-105',
        position === 'bottom-right' ? 'bottom-5 right-5' : 'bottom-5 left-5',
        focusRingClassName,
        className,
      )}
    >
      {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      {!open && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-semibold text-danger-foreground">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
