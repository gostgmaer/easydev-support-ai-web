import * as React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '../layout/Card';
import { Badge } from '../base/Badge';
import { DOCUMENT_STATUS_TONE } from './knowledge-status';
import type { KnowledgeArticleSummary } from '../../types/knowledge';
import { formatDate } from '../../utils';

export interface KnowledgeCardProps {
  article: KnowledgeArticleSummary;
  onClick: () => void;
}

export function KnowledgeCard({ article, onClick }: KnowledgeCardProps) {
  return (
    <Card>
      <button type="button" onClick={onClick} className="block w-full text-left">
        <CardContent className="space-y-1.5 p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {article.title}
            </span>
            <Badge tone={DOCUMENT_STATUS_TONE[article.status]}>{article.status}</Badge>
          </div>
          {article.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {article.categoryName && <span>{article.categoryName}</span>}
            <span>Updated {formatDate(article.updatedAt)}</span>
          </div>
        </CardContent>
      </button>
    </Card>
  );
}
