import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { focusRingClassName } from '@easydev/design-system';
import { Input } from './Input';
import { cn } from '../../utils';

export interface ColorPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  presets?: string[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PRESETS = [
  '#0EA5E9',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#14B8A6',
  '#64748B',
  '#0F172A',
];

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function ColorPicker({ value, onValueChange, presets = DEFAULT_PRESETS, disabled, className }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const isValid = HEX_PATTERN.test(value);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        disabled={disabled}
        className={cn(
          'flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          focusRingClassName,
          className,
        )}
      >
        <span
          className="h-5 w-5 rounded-full border border-border"
          style={{ backgroundColor: isValid ? value : 'transparent' }}
        />
        <span className="font-mono uppercase">{value}</span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-dropdown w-64 space-y-3 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-dropdown"
        >
          <div className="grid grid-cols-5 gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-label={preset}
                onClick={() => onValueChange(preset)}
                className={cn(
                  'h-8 w-8 rounded-md border-2',
                  preset.toLowerCase() === value.toLowerCase() ? 'border-primary' : 'border-transparent',
                )}
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Custom color"
              value={isValid ? value : '#000000'}
              onChange={(event) => onValueChange(event.target.value)}
              className="h-9 w-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
            />
            <Input
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              invalid={!isValid}
              className="font-mono uppercase"
              maxLength={7}
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
