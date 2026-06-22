import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '../base/Button';
import { IconButton } from '../base/IconButton';
import type { BulkAction } from '../../types/table';
import { cn } from '../../utils';

export interface BulkActionsProps<TData> {
  selected: TData[];
  actions: Array<BulkAction<TData>>;
  onClearSelection: () => void;
  className?: string;
}

export function BulkActions<TData>({ selected, actions, onClearSelection, className }: BulkActionsProps<TData>) {
  if (selected.length === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border border-border bg-popover px-3 py-2 shadow-floating',
        className,
      )}
    >
      <IconButton icon={<X className="h-4 w-4" />} label="Clear selection" size="sm" variant="ghost" onClick={onClearSelection} />
      <span className="text-sm font-medium text-foreground">{selected.length} selected</span>
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            type="button"
            size="sm"
            variant={action.tone === 'danger' ? 'danger' : 'outline'}
            disabled={action.isDisabled?.(selected)}
            onClick={() => action.onAction(selected)}
            leadingIcon={action.icon}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
