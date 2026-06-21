import * as React from 'react';
import { Mail } from 'lucide-react';
import { Input, type InputProps } from './Input';

export type EmailInputProps = Omit<InputProps, 'type' | 'startSlot'>;

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>((props, ref) => {
  return (
    <Input
      ref={ref}
      type="email"
      autoComplete="email"
      inputMode="email"
      startSlot={<Mail className="h-4 w-4" aria-hidden="true" />}
      {...props}
    />
  );
});
EmailInput.displayName = 'EmailInput';
