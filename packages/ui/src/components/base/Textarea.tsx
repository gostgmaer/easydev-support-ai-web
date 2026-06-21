import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { focusRingClassName } from '@easydev/design-system';
import { cn } from '../../utils';

export const textareaVariants = cva(
  cn(
    'flex w-full min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors',
    'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
    focusRingClassName,
  ),
  {
    variants: {
      invalid: {
        true: 'border-danger focus-visible:ring-danger',
        false: '',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      invalid: false,
      resize: 'vertical',
    },
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  autoGrow?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, resize, autoGrow = false, onInput, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoGrow) {
        const el = event.currentTarget;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
      onInput?.(event);
    };

    return (
      <textarea
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.RefObject<HTMLTextAreaElement | null>).current = node;
        }}
        aria-invalid={invalid || undefined}
        className={cn(textareaVariants({ invalid, resize: autoGrow ? 'none' : resize }), className)}
        onInput={handleInput}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
