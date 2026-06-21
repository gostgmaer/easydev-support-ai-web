import * as React from 'react';
import { User, Users, ShieldCheck, X } from 'lucide-react';
import { Select } from '../base/Select';
import { IconButton } from '../base/IconButton';
import type { PermissionGrant, PermissionLevel } from '../../types/knowledge';
import { cn } from '../../utils';

const PRINCIPAL_ICON: Record<PermissionGrant['principalType'], React.ComponentType<{ className?: string }>> = {
  user: User,
  team: Users,
  role: ShieldCheck,
};

const LEVEL_OPTIONS: Array<{ value: PermissionLevel; label: string }> = [
  { value: 'view', label: 'Can view' },
  { value: 'comment', label: 'Can comment' },
  { value: 'edit', label: 'Can edit' },
  { value: 'manage', label: 'Can manage' },
];

export interface PermissionViewerProps {
  grants: PermissionGrant[];
  onLevelChange: (grantId: string, level: PermissionLevel) => void;
  onRemove: (grantId: string) => void;
  className?: string;
}

export function PermissionViewer({ grants, onLevelChange, onRemove, className }: PermissionViewerProps) {
  return (
    <ul className={cn('space-y-2', className)}>
      {grants.map((grant) => {
        const Icon = PRINCIPAL_ICON[grant.principalType];
        return (
          <li key={grant.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {grant.principalName}
            </span>
            <span className="flex items-center gap-2">
              <Select value={grant.level} onValueChange={(level) => onLevelChange(grant.id, level)} options={LEVEL_OPTIONS} size="sm" className="w-36" />
              <IconButton icon={<X className="h-3.5 w-3.5" />} label={`Remove ${grant.principalName}`} size="xs" variant="ghost" onClick={() => onRemove(grant.id)} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
