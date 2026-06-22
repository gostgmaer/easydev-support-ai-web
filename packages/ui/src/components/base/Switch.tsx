import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { focusRingClassName } from '@easydev/design-system';
import { cn } from '../../utils';

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, 'checked' | 'onCheckedChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, label, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;

    const control = (
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full bg-neutral-200 transition-colors',
          'data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50',
          focusRingClassName,
          className,
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[1.375rem]" />
      </SwitchPrimitive.Root>
    );

    if (!label) return control;

    return (
      <div className="flex items-center gap-2">
        {control}
        <label htmlFor={switchId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      </div>
    );
  },
);
Switch.displayName = 'Switch';
