import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from '../base/Badge';
import { IconButton } from '../base/IconButton';
import { DOCUMENT_STATUS_TONE } from './knowledge-status';
import type { KnowledgeArticleSummary } from '../../types/knowledge';
import { cn } from '../../utils';

export interface DocumentPreviewProps {
  article: KnowledgeArticleSummary;
  onOpen: () => void;
  className?: string;
}

export function DocumentPreview({ article, onOpen, className }: DocumentPreviewProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 rounded-md border border-border bg-popover p-3 shadow-floating', className)}>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{article.title}</p>
          <Badge tone={DOCUMENT_STATUS_TONE[article.status]} size="sm">
            {article.status}
          </Badge>
        </div>
        {article.excerpt && <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{article.excerpt}</p>}
      </div>
      <IconButton icon={<ExternalLink className="h-4 w-4" />} label="Open article" size="sm" variant="ghost" onClick={onOpen} />
    </div>
  );
}
