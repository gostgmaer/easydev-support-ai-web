'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useArticleSearch, useCategories, useAskHelpAI } from '@/hooks/useHelpQueries';
import { useSearchStore } from '@/store/searchStore';
import { useAIHelpStore } from '@/store/aiHelpStore';
import { Search, HelpCircle, FileText, ChevronRight, X, Clock, Bot, Sparkles } from 'lucide-react';
import { Spinner, Input, Badge, Button } from '@easydev/ui';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('query') || '';

  const [searchVal, setSearchVal] = React.useState(queryParam);
  const [debouncedVal, setDebouncedVal] = React.useState(queryParam);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');

  const recentSearches = useSearchStore((state: any) => state.recentSearches);
  const addRecentSearch = useSearchStore((state: any) => state.addRecentSearch);
  const clearRecentSearches = useSearchStore((state: any) => state.clearRecentSearches);
  const popularSearches = useSearchStore((state: any) => state.popularSearches);

  // Load categories for filter dropdown
  const { data: categories } = useCategories();

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVal(searchVal);
      if (searchVal.trim()) {
        addRecentSearch(searchVal.trim());
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal, addRecentSearch]);

  const { data: results, isFetching: isSearching } = useArticleSearch(debouncedVal, selectedCategory || undefined);
  const askAI = useAskHelpAI();
  const aiMessages = useAIHelpStore((state) => state.chatHistory);
  const isAskingAI = useAIHelpStore((state) => state.isAskingAI);
  const lastAiAnswer = aiMessages.filter((m) => m.sender === 'assistant').slice(-1)[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      addRecentSearch(searchVal.trim());
      router.push(`/search?query=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handlePopularSearchClick = (term: string) => {
    setSearchVal(term);
    setDebouncedVal(term);
    addRecentSearch(term);
    router.push(`/search?query=${encodeURIComponent(term)}`);
  };

  return (
    <div className="space-y-6 py-4">
      {/* Search Input bar */}
      <section className="bg-white p-5 border border-neutral-200 rounded-xl shadow-3xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <Input
              value={searchVal}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchVal(e.target.value)}
              placeholder="Search guides, tutorials, FAQ answers..."
              className="pl-9 pr-8 text-xs h-9 bg-neutral-50/30"
            />
            {searchVal && (
              <button
                type="button"
                onClick={() => setSearchVal('')}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category filter select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-neutral-200 rounded px-2 text-xs font-semibold bg-white text-neutral-700 focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </form>

        {/* Popular searches suggestions */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="text-neutral-400 font-medium">Popular:</span>
          {popularSearches.map((term: string) => (
            <button
              key={term}
              type="button"
              onClick={() => handlePopularSearchClick(term)}
              className="px-2 py-0.5 border border-neutral-200 rounded hover:bg-neutral-50 text-neutral-600 font-semibold"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Main Results layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Results List */}
        <section className="lg:col-span-3 space-y-4">
          <h2 className="text-xs font-extrabold text-neutral-550 uppercase tracking-wider">
            Search Results {debouncedVal && `for "${debouncedVal}"`}
          </h2>

          {isSearching ? (
            <div className="flex justify-center py-12 bg-white border border-neutral-200 rounded-xl">
              <Spinner className="h-6 w-6 text-neutral-400" />
            </div>
          ) : !debouncedVal ? (
            <div className="p-8 text-center border border-neutral-200 rounded-xl bg-white space-y-2">
              <Search className="h-8 w-8 text-neutral-300 mx-auto" />
              <p className="font-bold text-neutral-700">Type a query above</p>
              <p className="text-neutral-400 text-[10px]">Search returns specific guides, troubleshooting wikis, and release fixes.</p>
            </div>
          ) : (!results || results.length === 0) ? (
            <div className="p-6 border border-neutral-200 rounded-xl bg-white space-y-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-neutral-300 shrink-0" />
                <div>
                  <p className="font-bold text-neutral-800 text-sm">No matching articles found</p>
                  <p className="text-neutral-400 text-[10px] leading-relaxed">
                    Try our AI assistant — it can answer directly from our knowledge base.
                  </p>
                </div>
              </div>
              {lastAiAnswer ? (
                <div className="rounded-lg border border-primary-100 bg-primary-50/40 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-primary-600">
                    <Bot className="h-3.5 w-3.5" />
                    AI Answer
                  </div>
                  <p className="text-xs text-neutral-800 leading-relaxed">{lastAiAnswer.content}</p>
                  <div className="flex gap-2 pt-1">
                    <Link href="/contact-support">
                      <Button size="sm" variant="outline" className="text-[10px] font-bold">Still need help?</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isAskingAI}
                  onClick={() => askAI.mutate({ query: debouncedVal })}
                  className="flex items-center gap-2 w-full rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-xs font-semibold text-primary-700 hover:bg-primary-100 disabled:opacity-60 transition"
                >
                  {isAskingAI ? (
                    <><Spinner className="h-3.5 w-3.5 text-primary-600" /> Asking AI…</>
                  ) : (
                    <><Sparkles className="h-3.5 w-3.5 text-cyan-500" /> Ask AI about "{debouncedVal}"</>
                  )}
                </button>
              )}
              <div className="flex justify-center gap-2 pt-1">
                <Link href="/contact-support">
                  <Button size="sm" variant="outline" className="text-xs font-bold">Contact Support</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((art) => (
                <Link
                  key={art.slug}
                  href={`/articles/${art.slug}`}
                  className="p-4 border border-neutral-200 hover:border-neutral-300 rounded-xl bg-white shadow-3xs flex justify-between items-center text-left transition group block"
                >
                  <div className="space-y-1.5 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{art.categoryName || 'Article'}</Badge>
                      <span className="text-[9px] text-neutral-400 font-semibold">Updated {new Date(art.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-extrabold text-neutral-800 text-xs group-hover:text-primary-600 transition truncate leading-snug">
                      {art.title}
                    </h3>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Sidebar: Recent Searches */}
        <aside className="space-y-4">
          <div className="border border-neutral-200 rounded-xl bg-white p-4 space-y-3 shadow-3xs">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-neutral-500 uppercase tracking-wider text-[9px]">Recent Searches</span>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[9px] text-neutral-400 hover:text-neutral-600 focus:outline-none"
                >
                  Clear
                </button>
              )}
            </div>
            {recentSearches.length === 0 ? (
              <p className="text-neutral-400 text-[10px] leading-relaxed">No recent searches inside this session.</p>
            ) : (
              <div className="space-y-2">
                {recentSearches.map((term: string, index: number) => (
                  <button
                    key={`${term}-${index}`}
                    onClick={() => handlePopularSearchClick(term)}
                    className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-semibold text-[10px] w-full text-left"
                  >
                    <Clock className="h-3 w-3 text-neutral-400" />
                    <span className="truncate">{term}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <React.Suspense fallback={null}>
      <SearchResultsContent />
    </React.Suspense>
  );
}
