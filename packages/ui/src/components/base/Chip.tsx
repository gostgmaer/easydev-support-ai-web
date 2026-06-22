import * as React from 'react';
import { X } from 'lucide-react';
import { focusRingClassName } from '@easydev/design-system';
import { cn } from '../../utils';

export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

export function Chip({ selected = false, onSelectedChange, onRemove, icon, className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
        selected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground hover:bg-muted',
      )}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelectedChange?.(!selected)}
        className={cn('flex items-center gap-1.5', focusRingClassName, className)}
        {...props}
      >
        {icon}
        {children}
      </button>
      {onRemove && (
        <button type="button" aria-label="Remove" onClick={onRemove} className="opacity-70 hover:opacity-100">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
