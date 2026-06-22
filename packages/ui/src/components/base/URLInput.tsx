import * as React from 'react';
import { Link2 } from 'lucide-react';
import { Input, type InputProps } from './Input';

export type URLInputProps = Omit<InputProps, 'type' | 'startSlot'>;

export const URLInput = React.forwardRef<HTMLInputElement, URLInputProps>((props, ref) => {
  return (
    <Input
      ref={ref}
      type="url"
      autoComplete="url"
      inputMode="url"
      placeholder="https://"
      startSlot={<Link2 className="h-4 w-4" aria-hidden="true" />}
      {...props}
    />
  );
});
URLInput.displayName = 'URLInput';
