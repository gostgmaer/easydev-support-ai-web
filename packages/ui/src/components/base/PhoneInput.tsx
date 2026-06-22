import * as React from 'react';
import { focusRingClassName } from '@easydev/design-system';
import { Input, type InputProps } from './Input';
import { cn } from '../../utils';

export interface PhoneCountryCode {
  code: string;
  dialCode: string;
  label: string;
}

const DEFAULT_COUNTRY_CODES: PhoneCountryCode[] = [
  { code: 'US', dialCode: '+1', label: 'US +1' },
  { code: 'GB', dialCode: '+44', label: 'UK +44' },
  { code: 'IN', dialCode: '+91', label: 'IN +91' },
  { code: 'AU', dialCode: '+61', label: 'AU +61' },
  { code: 'DE', dialCode: '+49', label: 'DE +49' },
];

export interface PhoneInputProps extends Omit<InputProps, 'type' | 'startSlot'> {
  dialCode: string;
  onDialCodeChange: (dialCode: string) => void;
  countryCodes?: PhoneCountryCode[];
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ dialCode, onDialCodeChange, countryCodes = DEFAULT_COUNTRY_CODES, className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="tel"
        autoComplete="tel"
        className={cn('rounded-l-none', className)}
        containerClassName="pl-0"
        startSlot={
          <select
            value={dialCode}
            onChange={(event) => onDialCodeChange(event.target.value)}
            aria-label="Country dial code"
            className={cn(
              'h-full rounded-l-md border-r border-border bg-muted px-2 text-sm text-foreground',
              focusRingClassName,
            )}
          >
            {countryCodes.map((country) => (
              <option key={country.code} value={country.dialCode}>
                {country.label}
              </option>
            ))}
          </select>
        }
        {...props}
      />
    );
  },
);
PhoneInput.displayName = 'PhoneInput';
