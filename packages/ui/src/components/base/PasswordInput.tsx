import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from './Input';
import { IconButton } from './IconButton';

export type PasswordInputProps = Omit<InputProps, 'type' | 'endSlot'>;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      autoComplete="current-password"
      endSlot={
        <IconButton
          icon={visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          label={visible ? 'Hide password' : 'Show password'}
          size="xs"
          variant="ghost"
          onClick={() => setVisible((prev) => !prev)}
        />
      }
      {...props}
    />
  );
});
PasswordInput.displayName = 'PasswordInput';
