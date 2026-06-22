import * as React from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { focusRingClassName } from '@easydev/design-system';
import { cn } from '../../utils';
import { calendarClassNames } from './calendar-class-names';

export interface DateRangePickerProps {
  value: DateRange | undefined;
  onValueChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  dateFormat?: string;
  numberOfMonths?: number;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date range',
  dateFormat = 'PP',
  numberOfMonths = 2,
  disabled,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const label = value?.from
    ? value.to
      ? `${format(value.from, dateFormat)} – ${format(value.to, dateFormat)}`
      : format(value.from, dateFormat)
    : placeholder;

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
        <span className={cn(!value?.from && 'text-muted-foreground')}>{label}</span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-dropdown overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-dropdown"
        >
          <DayPicker
            mode="range"
            selected={value}
            onSelect={onValueChange}
            numberOfMonths={numberOfMonths}
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
