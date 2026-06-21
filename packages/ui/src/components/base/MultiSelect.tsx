import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { focusRingClassName } from '@easydev/design-system';
import type { OptionItem } from '../../types/common';
import { cn } from '../../utils';

export interface MultiSelectProps<TValue extends string = string> {
  values: TValue[];
  onValuesChange: (values: TValue[]) => void;
  options: Array<OptionItem<TValue>>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxVisibleChips?: number;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect<TValue extends string = string>({
  values,
  onValuesChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results found.',
  maxVisibleChips = 3,
  disabled,
  className,
}: MultiSelectProps<TValue>) {
  const [open, setOpen] = React.useState(false);
  const selected = options.filter((option) => values.includes(option.value));

  const toggle = (optionValue: TValue) => {
    onValuesChange(
      values.includes(optionValue) ? values.filter((v) => v !== optionValue) : [...values, optionValue],
    );
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        disabled={disabled}
        className={cn(
          'flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm',
          'disabled:cursor-not-allowed disabled:opacity-50',
          focusRingClassName,
          className,
        )}
      >
        {selected.length === 0 && <span className="px-1 text-muted-foreground">{placeholder}</span>}
        {selected.slice(0, maxVisibleChips).map((option) => (
          <span
            key={String(option.value)}
            className="flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs text-foreground"
          >
            {option.label}
            <button
              type="button"
              aria-label={`Remove ${option.label}`}
              onClick={(event) => {
                event.stopPropagation();
                toggle(option.value);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {selected.length > maxVisibleChips && (
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            +{selected.length - maxVisibleChips} more
          </span>
        )}
        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-dropdown w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-dropdown"
        >
          <CommandPrimitive>
            <CommandPrimitive.Input
              placeholder={searchPlaceholder}
              className="w-full border-b border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <CommandPrimitive.List className="max-h-60 overflow-y-auto p-1">
              <CommandPrimitive.Empty className="px-2 py-4 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </CommandPrimitive.Empty>
              {options.map((option) => {
                const isSelected = values.includes(option.value);
                return (
                  <CommandPrimitive.Item
                    key={String(option.value)}
                    value={option.label}
                    disabled={option.disabled}
                    onSelect={() => toggle(option.value)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground',
                      'data-[selected=true]:bg-muted data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
                    )}
                  >
                    <Check className={cn('h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                    {option.icon}
                    {option.label}
                  </CommandPrimitive.Item>
                );
              })}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
