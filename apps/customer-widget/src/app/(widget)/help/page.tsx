'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import { EmptyState, Spinner } from '@easydev/ui';
import { useWidgetKnowledgeSearch, useWidgetArticle, useTrackWidgetEvent } from '../../../hooks/useWidgetQueries';
import { useWidgetStore } from '../../../store/widgetStore';

export default function WidgetHelpPage() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [activeSlug, setActiveSlug] = React.useState<string | null>(null);
  const sessionId = useWidgetStore((state) => state.widgetSessionId);
  const trackEvent = useTrackWidgetEvent();

  const { data: results = [], isLoading: isSearching } = useWidgetKnowledgeSearch(query);
  const { data: article, isLoading: isLoadingArticle } = useWidgetArticle(activeSlug);

  const handleOpenArticle = (slug: string, title: string) => {
    setActiveSlug(slug);
    if (sessionId) {
      trackEvent.mutate({ sessionId, eventName: 'article_view', eventData: { slug, title } });
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50/50 text-xs relative overflow-hidden">
      <div className="h-9 px-3 border-b border-neutral-100 bg-white flex items-center justify-between z-10 shrink-0">
        <button
          onClick={() => (activeSlug ? setActiveSlug(null) : router.push('/widget'))}
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 font-semibold focus:outline-none"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>
        <span className="font-bold text-neutral-800">Knowledge Base</span>
      </div>

      {activeSlug ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoadingArticle ? (
            <div className="flex justify-center py-8"><Spinner className="h-5 w-5 text-neutral-400" /></div>
          ) : article ? (
            <article className="space-y-2">
              <h2 className="font-extrabold text-neutral-900 text-sm">{article.title}</h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{article.content}</p>
            </article>
          ) : (
            <p className="text-neutral-400 text-center py-8">Article not found.</p>
          )}
        </div>
      ) : (
        <>
          <div className="p-3 border-b border-neutral-100 bg-white">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles..."
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="flex justify-center py-8"><Spinner className="h-5 w-5 text-neutral-400" /></div>
            ) : query.trim().length > 1 && results.length === 0 ? (
              <p className="text-neutral-400 text-center py-8">No articles found for &quot;{query}&quot;.</p>
            ) : results.length > 0 ? (
              <ul className="divide-y divide-neutral-100">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => handleOpenArticle(r.slug, r.title)}
                      className="w-full text-left px-4 py-3 hover:bg-white transition flex items-center gap-2.5"
                    >
                      <BookOpen className="h-4 w-4 text-neutral-400 shrink-0" />
                      <span className="font-semibold text-neutral-800">{r.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center h-full">
                <EmptyState
                  icon={<BookOpen className="h-6 w-6" />}
                  title="Search our help articles"
                  description="Type above to find guides and answers, or start a chat if you need direct help."
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
