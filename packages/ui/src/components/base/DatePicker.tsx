import * as React from 'react';
import { DayPicker, type Matcher } from 'react-day-picker';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { focusRingClassName } from '@easydev/design-system';
import { cn } from '../../utils';
import { calendarClassNames } from './calendar-class-names';

export interface DatePickerProps {
  value: Date | undefined;
  onValueChange: (date: Date | undefined) => void;
  placeholder?: string;
  dateFormat?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date',
  dateFormat = 'PPP',
  disabled,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const disabledMatchers: Matcher[] = [];
  if (minDate) disabledMatchers.push({ before: minDate });
  if (maxDate) disabledMatchers.push({ after: maxDate });

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          focusRingClassName,
          className,
        )}
      >
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <span className={cn(!value && 'text-muted-foreground')}>{value ? format(value, dateFormat) : placeholder}</span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-dropdown overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-dropdown"
        >
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              onValueChange(date);
              setOpen(false);
            }}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            classNames={calendarClassNames}
            components={{
              Chevron: ({ orientation }) =>
                orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
            }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
