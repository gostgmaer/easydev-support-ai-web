import React, { useState } from 'react';
import { Search, FileText, Send, ArrowRight, BookOpen } from 'lucide-react';
import { useKnowledgeSearch } from '../hooks/useQueries';
import { useConversationStore } from '../store/conversationStore';
import { useInboxStore } from '../store/inboxStore';

export function KnowledgePanel() {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const [query, setQuery] = useState('');
  const { data: articles = [], isLoading } = useKnowledgeSearch(query);
  const appendDraft = useConversationStore((state) => state.setDraft);
  const currentDraft = useConversationStore((state) => {
    if (!activeConversationId) return '';
    return state.drafts[activeConversationId] || '';
  });

  const handleQuickInsert = (content: string) => {
    if (!activeConversationId) return;
    const combined = currentDraft ? `${currentDraft}\n\n${content}` : content;
    appendDraft(activeConversationId, combined);
  };

  return (
    <div className="flex flex-col h-full bg-white divide-y divide-neutral-100 overflow-y-auto" aria-label="Knowledge Base Panel">
      {/* Search Input Box */}
      <div className="p-4">
        <label htmlFor="kb-search-input" className="sr-only">Search Knowledge Base</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            id="kb-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles..."
            className="w-full text-xs rounded border border-neutral-200 pl-9 pr-3 py-2 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Suggested Articles / Results */}
      <div className="flex-1 p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          <span>Suggested Articles</span>
        </h3>

        {isLoading && (
          <div className="text-center text-xs text-neutral-400 py-6 animate-pulse">
            Searching knowledge documents...
          </div>
        )}

        {!isLoading && query && articles.length === 0 && (
          <div className="text-center text-xs text-neutral-400 py-6">
            No matching articles found.
          </div>
        )}

        {!isLoading && !query && (
          <div className="text-center text-xs text-neutral-400 py-6">
            Type query above to search documentation.
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="p-3 border border-neutral-200 rounded hover:border-primary-300 transition-all bg-neutral-50/50 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center gap-2 mb-1.5">
                    <span className="font-bold text-xs text-neutral-900 truncate">
                      {article.title}
                    </span>
                    <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.25 rounded font-black flex-shrink-0">
                      {Math.round(article.score * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    {article.content}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleQuickInsert(article.content)}
                    className="flex-1 flex items-center justify-center gap-1 bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-[10px] py-1 rounded transition"
                    aria-label={`Insert content of ${article.title}`}
                  >
                    <Send className="h-3 w-3" />
                    <span>Insert Article</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
