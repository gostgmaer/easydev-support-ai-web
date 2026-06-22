import * as React from 'react';
import { Columns3, ChevronUp, ChevronDown } from 'lucide-react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Button } from '../base/Button';
import { Checkbox } from '../base/Checkbox';
import { cn } from '../../utils';

export interface ColumnManagerEntry {
  id: string;
  label: string;
  visible: boolean;
  locked?: boolean;
}

export interface ColumnManagerProps {
  columns: ColumnManagerEntry[];
  onVisibilityChange: (id: string, visible: boolean) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export function ColumnManager({ columns, onVisibilityChange, onReorder }: ColumnManagerProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <Button variant="outline" size="sm" leadingIcon={<Columns3 className="h-4 w-4" />}>
          Columns
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={4}
          className="z-dropdown w-64 space-y-1 rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-dropdown"
        >
          {columns.map((column, index) => (
            <div key={column.id} className="flex items-center gap-2 rounded-sm px-1 py-1 hover:bg-muted">
              <Checkbox
                checked={column.visible}
                disabled={column.locked}
                onCheckedChange={(checked) => onVisibilityChange(column.id, checked === true)}
                label={column.label}
                className={cn(column.locked && 'opacity-50')}
              />
              {onReorder && (
                <div className="ml-auto flex flex-col">
                  <button
                    type="button"
                    aria-label={`Move ${column.label} up`}
                    disabled={index === 0}
                    onClick={() => onReorder(index, index - 1)}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${column.label} down`}
                    disabled={index === columns.length - 1}
                    onClick={() => onReorder(index, index + 1)}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
