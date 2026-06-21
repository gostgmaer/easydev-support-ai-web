import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { focusRingClassName } from '@easydev/design-system';
import type { OptionItem, GroupedOptions, ComponentSize } from '../../types/common';
import { cn } from '../../utils';

function isGrouped<TValue>(
  options: Array<OptionItem<TValue>> | Array<GroupedOptions<TValue>>,
): options is Array<GroupedOptions<TValue>> {
  return options.length > 0 && 'options' in options[0]!;
}

const SIZE_CLASS: Record<ComponentSize, string> = {
  xs: 'h-7 px-2 text-xs',
  sm: 'h-8 px-2.5 text-sm',
  md: 'h-10 px-3 text-sm',
  lg: 'h-11 px-4 text-base',
  xl: 'h-12 px-4 text-base',
};

export interface SelectProps<TValue extends string = string> {
  value: TValue | undefined;
  onValueChange: (value: TValue) => void;
  options: Array<OptionItem<TValue>> | Array<GroupedOptions<TValue>>;
  placeholder?: string;
  size?: ComponentSize;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  className?: string;
  'aria-label'?: string;
}

export function Select<TValue extends string = string>({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  size = 'md',
  disabled,
  invalid,
  name,
  className,
  'aria-label': ariaLabel,
}: SelectProps<TValue>) {
  const flatOptions = isGrouped(options) ? options.flatMap((group) => group.options) : options;
  const selected = flatOptions.find((option) => option.value === value);

  const renderItem = (option: OptionItem<TValue>) => (
    <SelectPrimitive.Item
      key={String(option.value)}
      value={String(option.value)}
      disabled={option.disabled}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none',
        'data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      )}
    >
      {option.icon}
      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2">
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next as TValue)}
      disabled={disabled}
      name={name}
    >
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background text-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          SIZE_CLASS[size],
          invalid && 'border-danger focus-visible:ring-danger',
          focusRingClassName,
          className,
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-dropdown max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-dropdown"
        >
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1">
            <ChevronUp className="h-4 w-4" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">
            {isGrouped(options)
              ? options.map((group, groupIndex) => (
                  <SelectPrimitive.Group key={group.label}>
                    {groupIndex > 0 && <SelectPrimitive.Separator className="my-1 h-px bg-border" />}
                    <SelectPrimitive.Label className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </SelectPrimitive.Label>
                    {group.options.map(renderItem)}
                  </SelectPrimitive.Group>
                ))
              : options.map(renderItem)}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1">
            <ChevronDown className="h-4 w-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
