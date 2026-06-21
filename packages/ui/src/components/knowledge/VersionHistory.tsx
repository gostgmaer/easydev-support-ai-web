import * as React from 'react';
import { History, RotateCcw } from 'lucide-react';
import { IconButton } from '../base/IconButton';
import type { DocumentVersionEntry } from '../../types/knowledge';
import { formatRelativeTime } from '../../utils';
import { cn } from '../../utils';

export interface VersionHistoryProps {
  versions: DocumentVersionEntry[];
  onRestore: (version: DocumentVersionEntry) => void;
  className?: string;
}

export function VersionHistory({ versions, onRestore, className }: VersionHistoryProps) {
  return (
    <ol className={cn('space-y-2', className)}>
      {versions.map((version) => (
        <li key={version.id} className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2">
          <div className="flex items-start gap-2">
            <History className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {version.versionLabel}
                {version.isCurrent && <span className="ml-2 text-xs text-success">Current</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {version.editedBy} · {formatRelativeTime(version.editedAt)}
              </p>
              {version.changeSummary && <p className="mt-0.5 text-xs text-muted-foreground">{version.changeSummary}</p>}
            </div>
          </div>
          {!version.isCurrent && (
            <IconButton icon={<RotateCcw className="h-3.5 w-3.5" />} label={`Restore ${version.versionLabel}`} size="xs" variant="ghost" onClick={() => onRestore(version)} />
          )}
        </li>
      ))}
    </ol>
  );
}
