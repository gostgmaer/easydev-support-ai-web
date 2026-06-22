import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { focusRingClassName } from '@easydev/design-system';
import type { OptionItem } from '../../types/common';
import { cn } from '../../utils';

export interface RadioGroupProps<TValue extends string = string>
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'value' | 'onValueChange'> {
  value: TValue;
  onValueChange: (value: TValue) => void;
  options: Array<OptionItem<TValue>>;
  orientation?: 'vertical' | 'horizontal';
}

export function RadioGroup<TValue extends string = string>({
  value,
  onValueChange,
  options,
  orientation = 'vertical',
  className,
  ...props
}: RadioGroupProps<TValue>) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next as TValue)}
      className={cn('flex gap-3', orientation === 'vertical' ? 'flex-col' : 'flex-row items-center', className)}
      {...props}
    >
      {options.map((option) => {
        const itemId = `radio-${option.value}`;
        return (
          <div key={String(option.value)} className="flex items-start gap-2">
            <RadioGroupPrimitive.Item
              id={itemId}
              value={String(option.value)}
              disabled={option.disabled}
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border bg-background',
                'data-[state=checked]:border-primary',
                'disabled:cursor-not-allowed disabled:opacity-50',
                focusRingClassName,
              )}
            >
              <RadioGroupPrimitive.Indicator className="h-2 w-2 rounded-full bg-primary" />
            </RadioGroupPrimitive.Item>
            <div className="grid gap-0.5 leading-none">
              <label htmlFor={itemId} className="text-sm font-medium text-foreground">
                {option.label}
              </label>
              {option.description && <p className="text-xs text-muted-foreground">{option.description}</p>}
            </div>
          </div>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
