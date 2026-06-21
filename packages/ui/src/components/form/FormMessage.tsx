import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { useFormFieldContext } from './form-field-context';
import { cn } from '../../utils';

export type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>;

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, id, children, ...props }, ref) => {
    const field = useFormFieldContext();
    const message = children ?? field?.error?.message;
    if (!message) return null;

    return (
      <p
        ref={ref}
        id={id ?? (field ? `${field.id}-message` : undefined)}
        role="alert"
        className={cn('flex items-center gap-1 text-xs font-medium text-danger', className)}
        {...props}
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {message}
      </p>
    );
  },
);
FormMessage.displayName = 'FormMessage';
