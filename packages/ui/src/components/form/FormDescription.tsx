import * as React from 'react';
import { useFormFieldContext } from './form-field-context';
import { cn } from '../../utils';

export type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, id, ...props }, ref) => {
    const field = useFormFieldContext();
    return (
      <p
        ref={ref}
        id={id ?? (field ? `${field.id}-description` : undefined)}
        className={cn('text-xs text-muted-foreground', className)}
        {...props}
      />
    );
  },
);
FormDescription.displayName = 'FormDescription';
