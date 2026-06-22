import * as React from 'react';
import { Check } from 'lucide-react';
import type { PresenceStatus as PresenceStatusValue } from '@easydev/types';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../base/Dropdown';
import { cn } from '../../utils';

const STATUS_OPTIONS: Array<{ value: PresenceStatusValue; label: string; dotClassName: string }> = [
  { value: 'ONLINE', label: 'Online', dotClassName: 'bg-success' },
  { value: 'AWAY', label: 'Away', dotClassName: 'bg-warning' },
  { value: 'BUSY', label: 'Busy', dotClassName: 'bg-danger' },
  { value: 'OFFLINE', label: 'Appear offline', dotClassName: 'bg-neutral-400' },
];

export interface PresenceStatusProps {
  status: PresenceStatusValue;
  onStatusChange: (status: PresenceStatusValue) => void;
}

export function PresenceStatus({ status, onStatusChange }: PresenceStatusProps) {
  const current = STATUS_OPTIONS.find((option) => option.value === status) ?? STATUS_OPTIONS[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-foreground hover:bg-muted">
        <span className={cn('h-2 w-2 rounded-full', current.dotClassName)} />
        {current.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => onStatusChange(option.value)} className="justify-between">
            <span className="flex items-center gap-2">
              <span className={cn('h-2 w-2 rounded-full', option.dotClassName)} />
              {option.label}
            </span>
            {option.value === status && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
