import * as React from 'react';
import { useFormContext, Controller, ControllerProps, FieldPath, FieldValues } from 'react-hook-form';

// Form Context for passing name references
interface FormItemContextValue {
  name: string;
}
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormItemContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormItemContext.Provider>
  );
}

export function FormItem({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`space-y-2 ${className}`} {...props} />;
}

export function FormLabel({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const { name } = React.useContext(FormItemContext);
  return (
    <label
      htmlFor={name}
      className={`text-sm font-medium leading-none text-neutral-900 ${className}`}
      {...props}
    />
  );
}

export function FormMessage({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { name } = React.useContext(FormItemContext);
  const { formState: { errors } } = useFormContext();
  
  const error = errors[name];
  const message = error ? String(error.message) : null;

  if (!message) return null;

  return (
    <p
      id={`${name}-error`}
      className={`text-xs font-semibold text-danger ${className}`}
      {...props}
    >
      {message}
    </p>
  );
}
