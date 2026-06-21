import * as React from 'react';
import {
  Controller,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type ControllerFieldState,
  type ControllerProps,
} from 'react-hook-form';
import { FormFieldContext } from './form-field-context';
import { FormLabel } from './FormLabel';
import { FormDescription } from './FormDescription';
import { FormMessage } from './FormMessage';
import { cn } from '../../utils';

export interface FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  className?: string;
  rules?: ControllerProps<TFieldValues, TName>['rules'];
  defaultValue?: ControllerProps<TFieldValues, TName>['defaultValue'];
  render: (props: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    id: string;
  }) => React.ReactElement;
}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  name,
  label,
  description,
  required,
  className,
  rules,
  defaultValue,
  render,
}: FormFieldProps<TFieldValues, TName>) {
  const id = React.useId();

  return (
    <Controller<TFieldValues, TName>
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <FormFieldContext.Provider value={{ id, name, error: fieldState.error }}>
          <div className={cn('space-y-1.5', className)}>
            {label && (
              <FormLabel htmlFor={id} required={required}>
                {label}
              </FormLabel>
            )}
            {render({ field, fieldState, id })}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormFieldContext.Provider>
      )}
    />
  );
}
