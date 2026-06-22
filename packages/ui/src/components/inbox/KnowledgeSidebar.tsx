import * as React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Panel } from '../layout/Panel';
import { SearchInput } from '../base/SearchInput';
import type { KnowledgeArticleSummary } from '../../types/knowledge';

export interface KnowledgeSidebarProps {
  articles: KnowledgeArticleSummary[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onArticleSelect: (article: KnowledgeArticleSummary) => void;
}

export function KnowledgeSidebar({ articles, searchValue, onSearchChange, onArticleSelect }: KnowledgeSidebarProps) {
  return (
    <Panel title="Suggested articles" icon={<FileText className="h-4 w-4" />}>
      <SearchInput
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        onClear={() => onSearchChange('')}
        placeholder="Search knowledge base"
        className="mb-3"
      />
      <ul className="space-y-2">
        {articles.map((article) => (
          <li key={article.id}>
            <button
              type="button"
              onClick={() => onArticleSelect(article)}
              className="flex w-full items-start justify-between gap-2 rounded-md border border-border px-3 py-2 text-left hover:bg-muted"
            >
              <span>
                <span className="block text-sm font-medium text-foreground">{article.title}</span>
                {article.excerpt && <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">{article.excerpt}</span>}
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
