import * as React from 'react';
import { Clock } from 'lucide-react';
import { Input, type InputProps } from './Input';

export interface TimePickerProps extends Omit<InputProps, 'type' | 'startSlot' | 'value' | 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
  step?: number;
}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ value, onValueChange, step = 60, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="time"
        step={step}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        startSlot={<Clock className="h-4 w-4" aria-hidden="true" />}
        {...props}
      />
    );
  },
);
TimePicker.displayName = 'TimePicker';
