import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Filter } from 'lucide-react';
import { Button } from '../base/Button';
import { Badge } from '../base/Badge';
import { FilterBuilder, type FilterFieldDef } from './FilterBuilder';
import type { FilterGroup } from '../../types/table';

export interface AdvancedFiltersProps {
  fields: FilterFieldDef[];
  value: FilterGroup;
  onChange: (value: FilterGroup) => void;
  onApply?: () => void;
  onClear?: () => void;
}

export function AdvancedFilters({ fields, value, onChange, onApply, onClear }: AdvancedFiltersProps) {
  const [open, setOpen] = React.useState(false);
  const activeCount = value.conditions.length;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button variant="outline" size="sm" leadingIcon={<Filter className="h-4 w-4" />}>
          Filters
          {activeCount > 0 && (
            <Badge tone="primary" size="sm">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-dropdown w-[36rem] max-w-[90vw] space-y-4 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-dropdown"
        >
          <FilterBuilder fields={fields} value={value} onChange={onChange} />
          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onClear?.();
              }}
            >
              Clear all
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onApply?.();
                setOpen(false);
              }}
            >
              Apply filters
            </Button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
