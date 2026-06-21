import * as React from 'react';
import type { FieldError } from 'react-hook-form';

export interface FormFieldContextValue {
  id: string;
  name: string;
  error?: FieldError;
}

export const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export function useFormFieldContext(): FormFieldContextValue | null {
  return React.useContext(FormFieldContext);
}
