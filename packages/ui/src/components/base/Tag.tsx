import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  onRemove?: () => void;
}

export function Tag({ color, onRemove, className, children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground',
        className,
      )}
      {...props}
    >
      {color && <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove tag"
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
