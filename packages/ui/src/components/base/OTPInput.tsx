import * as React from 'react';
import { focusRingClassName } from '@easydev/design-system';
import { cn } from '../../utils';

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  'aria-label'?: string;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  invalid = false,
  autoFocus = false,
  'aria-label': ariaLabel = 'One-time passcode',
}: OTPInputProps) {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(() => {
    const padded = value.padEnd(length, ' ').slice(0, length);
    return padded.split('');
  }, [value, length]);

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length && !next.includes(' ')) onComplete?.(next);
  };

  const focusIndex = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, '').slice(-1);
    const chars = value.padEnd(length, ' ').slice(0, length).split('');
    chars[index] = char || ' ';
    const next = chars.join('').replace(/\s+$/, '');
    commit(next);
    if (char && index < length - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      focusIndex(index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    commit(pasted.padEnd(length, ' ').replace(/\s+$/, ''));
    focusIndex(Math.min(pasted.length, length - 1));
  };

  return (
    <div role="group" aria-label={ariaLabel} className="flex gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={`Digit ${index + 1} of ${length}`}
          value={digit.trim()}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className={cn(
            'h-12 w-10 rounded-md border border-border bg-background text-center text-lg font-semibold text-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            invalid && 'border-danger focus-visible:ring-danger',
            focusRingClassName,
          )}
        />
      ))}
    </div>
  );
}
