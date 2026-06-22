import * as React from 'react';
import { Badge } from '../base/Badge';
import { DOCUMENT_STATUS_TONE } from './knowledge-status';
import type { DocumentStatus } from '../../types/knowledge';
import { formatDate } from '../../utils';
import { cn } from '../../utils';

export interface DocumentViewerProps {
  title: string;
  content: string;
  status: DocumentStatus;
  updatedAt: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DocumentViewer({ title, content, status, updatedAt, actions, className }: DocumentViewerProps) {
  return (
    <article className={cn('space-y-4', className)}>
      <header className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge tone={DOCUMENT_STATUS_TONE[status]}>{status}</Badge>
            Updated {formatDate(updatedAt)}
          </p>
        </div>
        {actions}
      </header>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{content}</div>
    </article>
  );
}
