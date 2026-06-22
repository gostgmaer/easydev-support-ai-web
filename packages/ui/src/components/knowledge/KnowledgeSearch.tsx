import * as React from 'react';
import { SearchInput } from '../base/SearchInput';
import { KnowledgeCard } from './KnowledgeCard';
import { Spinner } from '../base/Spinner';
import type { KnowledgeArticleSummary } from '../../types/knowledge';
import { cn } from '../../utils';

export interface KnowledgeSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: KnowledgeArticleSummary[];
  onSelectArticle: (article: KnowledgeArticleSummary) => void;
  isSearching?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

export function KnowledgeSearch({ query, onQueryChange, results, onSelectArticle, isSearching = false, emptyState, className }: KnowledgeSearchProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <SearchInput value={query} onChange={(event) => onQueryChange(event.target.value)} onClear={() => onQueryChange('')} placeholder="Search articles…" />
      {isSearching ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : results.length === 0 && emptyState ? (
        emptyState
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {results.map((article) => (
            <KnowledgeCard key={article.id} article={article} onClick={() => onSelectArticle(article)} />
          ))}
        </div>
      )}
    </div>
  );
}
