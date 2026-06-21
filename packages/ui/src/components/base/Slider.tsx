import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { focusRingClassName } from '@easydev/design-system';
import { cn } from '../../utils';

export interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'value' | 'onValueChange'> {
  value: number[];
  onValueChange: (value: number[]) => void;
  showValueLabel?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  ({ value, onValueChange, showValueLabel = false, formatValue = String, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <SliderPrimitive.Root
          ref={ref}
          value={value}
          onValueChange={onValueChange}
          className={cn('relative flex h-5 w-full touch-none select-none items-center', className)}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-neutral-200">
            <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
          </SliderPrimitive.Track>
          {value.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className={cn(
                'block h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm',
                'disabled:pointer-events-none disabled:opacity-50',
                focusRingClassName,
              )}
            />
          ))}
        </SliderPrimitive.Root>
        {showValueLabel && (
          <div className="flex justify-between text-xs text-muted-foreground">
            {value.map((v, index) => (
              <span key={index}>{formatValue(v)}</span>
            ))}
          </div>
        )}
      </div>
    );
  },
);
Slider.displayName = 'Slider';
