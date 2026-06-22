import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { focusRingClassName } from '@easydev/design-system';
import { cn } from '../../utils';

export const inputVariants = cva(
  cn(
    'flex w-full rounded-md border border-border bg-background text-foreground transition-colors',
    'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
    focusRingClassName,
  ),
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-sm',
        md: 'h-10 px-3 text-sm',
        lg: 'h-11 px-4 text-base',
      },
      invalid: {
        true: 'border-danger focus-visible:ring-danger',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      invalid: false,
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'>,
    VariantProps<typeof inputVariants> {
  startSlot?: React.ReactNode;
  endSlot?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, size, invalid, startSlot, endSlot, type = 'text', ...props }, ref) => {
    if (!startSlot && !endSlot) {
      return (
        <input
          ref={ref}
          type={type}
          aria-invalid={invalid || undefined}
          className={cn(inputVariants({ size, invalid }), className)}
          {...props}
        />
      );
    }

    return (
      <div
        className={cn(
          inputVariants({ size, invalid }),
          'gap-2 px-3 [&>input]:h-full [&>input]:flex-1 [&>input]:border-0 [&>input]:bg-transparent [&>input]:p-0 [&>input]:outline-none [&>input]:focus:ring-0',
          containerClassName,
        )}
      >
        {startSlot && <span className="flex shrink-0 items-center text-muted-foreground">{startSlot}</span>}
        <input ref={ref} type={type} aria-invalid={invalid || undefined} className={className} {...props} />
        {endSlot && <span className="flex shrink-0 items-center text-muted-foreground">{endSlot}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';
