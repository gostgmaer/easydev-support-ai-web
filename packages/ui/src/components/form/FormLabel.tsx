import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { useFormFieldContext } from './form-field-context';
import { cn } from '../../utils';

export interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  required?: boolean;
}

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, htmlFor, required, children, ...props }, ref) => {
    const field = useFormFieldContext();
    return (
      <LabelPrimitive.Root
        ref={ref}
        htmlFor={htmlFor ?? field?.id}
        className={cn(
          'text-sm font-medium text-foreground',
          field?.error && 'text-danger',
          className,
        )}
        {...props}
      >
        {children}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </LabelPrimitive.Root>
    );
  },
);
FormLabel.displayName = 'FormLabel';
