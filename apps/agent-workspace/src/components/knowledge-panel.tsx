import React, { useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { KnowledgeSearch, DocumentViewer, NoKnowledgeEmptyState } from '@easydev/ui';
import { useKnowledgeSearch } from '../hooks/useKnowledgeQueries';
import { toKnowledgeArticleSummary } from '../lib/ui-adapters';
import { KnowledgeArticle } from '../types';

export function KnowledgePanel() {
  const [query, setQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const { data: results = [], isFetching } = useKnowledgeSearch(query);

  if (selectedArticle) {
    return (
      <div className="p-4">
        <DocumentViewer
          title={selectedArticle.title}
          content={selectedArticle.content}
          status="PUBLISHED"
          updatedAt={new Date().toISOString()}
          actions={
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to results
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <KnowledgeSearch
        query={query}
        onQueryChange={setQuery}
        results={results.map(toKnowledgeArticleSummary)}
        onSelectArticle={(summary) => {
          const article = results.find((r) => r.id === summary.id);
          if (article) setSelectedArticle(article);
        }}
        isSearching={isFetching}
        emptyState={
          query.length > 1 ? (
            <NoKnowledgeEmptyState />
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-xs text-neutral-400">
              <BookOpen className="h-6 w-6 text-neutral-300" />
              <p>Search the knowledge base for relevant articles.</p>
            </div>
          )
        }
      />
    </div>
  );
}
