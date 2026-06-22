import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../utils';

export interface ProgressProps extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'value'> {
  value: number;
  max?: number;
  showLabel?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = false, ...props }, ref) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div className="flex items-center gap-2">
        <ProgressPrimitive.Root
          ref={ref}
          value={value}
          max={max}
          className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className="h-full w-full flex-1 bg-primary transition-transform"
            style={{ transform: `translateX(-${100 - percent}%)` }}
          />
        </ProgressPrimitive.Root>
        {showLabel && <span className="text-xs text-muted-foreground">{Math.round(percent)}%</span>}
      </div>
    );
  },
);
Progress.displayName = 'Progress';
