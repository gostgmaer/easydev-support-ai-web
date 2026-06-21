'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Clock, Search as SearchIcon } from 'lucide-react';
import {
  SearchInput,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ConversationCard,
  KnowledgeCard,
  Badge,
  NoResultsEmptyState,
} from '@easydev/ui';
import { useSearchStore } from '../../../store/searchStore';
import { useInboxStore } from '../../../store/inboxStore';
import { useConversationSearch, useTicketSearch } from '../../../hooks/useQueries';
import { useKnowledgeSearch } from '../../../hooks/useKnowledgeQueries';
import { toConversationSummary, toKnowledgeArticleSummary } from '../../../lib/ui-adapters';

export default function SearchPage() {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const category = useSearchStore((state) => state.category);
  const setCategory = useSearchStore((state) => state.setCategory);
  const recentSearches = useSearchStore((state) => state.recentSearches);
  const addRecentSearch = useSearchStore((state) => state.addRecentSearch);
  const clearRecentSearches = useSearchStore((state) => state.clearRecentSearches);
  const setActiveConversationId = useInboxStore((state) => state.setActiveConversationId);

  const { data: conversations = [], isLoading: conversationsLoading } = useConversationSearch(
    category === 'all' || category === 'conversations' ? query : '',
  );
  const { data: tickets = [], isLoading: ticketsLoading } = useTicketSearch(
    category === 'all' || category === 'tickets' ? query : '',
  );
  const { data: articles = [], isLoading: knowledgeLoading } = useKnowledgeSearch(
    category === 'all' || category === 'knowledge' ? query : '',
  );

  useEffect(() => {
    if (query.trim().length > 1) {
      const timeout = setTimeout(() => addRecentSearch(query.trim()), 1000);
      return () => clearTimeout(timeout);
    }
  }, [query, addRecentSearch]);

  const isLoading = conversationsLoading || ticketsLoading || knowledgeLoading;
  const hasResults = conversations.length > 0 || tickets.length > 0 || articles.length > 0;

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto p-6">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Search</h1>

      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        placeholder="Search conversations, tickets, knowledge…"
        autoFocus
      />

      {!query && recentSearches.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Recent searches</h2>
            <button onClick={clearRecentSearches} className="text-xs text-neutral-400 hover:underline">
              Clear
            </button>
          </div>
          {recentSearches.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-neutral-600 hover:bg-neutral-50"
            >
              <Clock className="h-3.5 w-3.5 text-neutral-300" />
              {q}
            </button>
          ))}
        </div>
      )}

      {query.length > 1 && (
        <Tabs value={category} onValueChange={(v) => setCategory(v as typeof category)} className="mt-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value={category}>
            {isLoading ? (
              <p className="py-8 text-center text-sm text-neutral-400">Searching…</p>
            ) : category === 'customers' ? (
              <p className="py-8 text-center text-sm italic text-neutral-400">
                Customer search isn&apos;t available yet.
              </p>
            ) : !hasResults ? (
              <NoResultsEmptyState />
            ) : (
              <div className="space-y-6">
                {(category === 'all' || category === 'conversations') && conversations.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Conversations</h3>
                    <div className="divide-y divide-neutral-100 rounded-md border border-neutral-200">
                      {conversations.map((conv) => (
                        <Link key={conv.id} href={`/conversations/${conv.id}`} onClick={() => setActiveConversationId(conv.id)}>
                          <ConversationCard conversation={toConversationSummary(conv)} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {(category === 'all' || category === 'tickets') && tickets.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Tickets</h3>
                    <div className="space-y-2">
                      {tickets.map((ticket) => (
                        <Link
                          key={ticket.id}
                          href={`/tickets/${ticket.id}`}
                          className="flex items-center justify-between rounded border border-neutral-200 p-3 text-sm hover:bg-neutral-50"
                        >
                          <span className="font-medium text-neutral-800">{ticket.subject}</span>
                          <Badge tone="neutral">{ticket.status}</Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {(category === 'all' || category === 'knowledge') && articles.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Knowledge base</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {articles.map((article) => (
                        <KnowledgeCard key={article.id} article={toKnowledgeArticleSummary(article)} onClick={() => {}} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!query && recentSearches.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-neutral-400">
          <SearchIcon className="h-6 w-6 text-neutral-300" />
          <p>Search across conversations, tickets, and the knowledge base.</p>
        </div>
      )}
    </div>
  );
}
