import * as React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Input, type InputProps } from './Input';
import { cn } from '../../utils';

export interface NumberInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange' | 'endSlot'> {
  value: number | null;
  onValueChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onValueChange, min, max, step = 1, className, ...props }, ref) => {
    const clamp = (next: number): number => {
      let result = next;
      if (typeof min === 'number') result = Math.max(min, result);
      if (typeof max === 'number') result = Math.min(max, result);
      return result;
    };

    const handleStep = (direction: 1 | -1) => {
      const base = value ?? 0;
      onValueChange(clamp(base + direction * step));
    };

    return (
      <Input
        ref={ref}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value ?? ''}
        onChange={(event) => {
          const raw = event.target.value;
          onValueChange(raw === '' ? null : Number(raw));
        }}
        className={cn('pr-8 [&::-webkit-inner-spin-button]:appearance-none', className)}
        endSlot={
          <div className="flex flex-col">
            <button
              type="button"
              tabIndex={-1}
              aria-label="Increment"
              onClick={() => handleStep(1)}
              className="flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="Decrement"
              onClick={() => handleStep(-1)}
              className="flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        }
        {...props}
      />
    );
  },
);
NumberInput.displayName = 'NumberInput';
