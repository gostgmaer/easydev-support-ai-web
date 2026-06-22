import * as React from 'react';
import { Input, type InputProps } from './Input';

export interface CurrencyInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange' | 'startSlot'> {
  value: number | null;
  onValueChange: (value: number | null) => void;
  currency?: string;
  locale?: string;
}

function currencySymbol(currency: string, locale: string): string {
  const parts = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0);
  return parts.find((part) => part.type === 'currency')?.value ?? currency;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, currency = 'USD', locale = 'en-US', ...props }, ref) => {
    const [draft, setDraft] = React.useState(value !== null ? String(value) : '');

    React.useEffect(() => {
      setDraft(value !== null ? String(value) : '');
    }, [value]);

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        startSlot={<span className="text-sm font-medium">{currencySymbol(currency, locale)}</span>}
        value={draft}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
            setDraft(raw);
            onValueChange(raw === '' ? null : Number(raw));
          }
        }}
        onBlur={(event) => {
          if (draft !== '') setDraft(Number(draft).toFixed(2));
          props.onBlur?.(event);
        }}
        {...props}
      />
    );
  },
);
CurrencyInput.displayName = 'CurrencyInput';
