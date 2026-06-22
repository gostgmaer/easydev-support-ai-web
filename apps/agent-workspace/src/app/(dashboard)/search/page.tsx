'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MessageSquare, Ticket, User, ArrowRight, History } from 'lucide-react';
import { useSearchStore } from '../../../store/searchStore';
import { useInboxStore } from '../../../store/inboxStore';
import { useConversationSearch, useTicketSearch, useCustomerSearch } from '../../../hooks/useQueries';

interface SearchResultItem {
  id: string;
  type: 'conversation' | 'ticket' | 'customer';
  title: string;
  subtitle: string;
  link: string;
}

export default function SearchPage() {
  const router = useRouter();
  const { query, setQuery, category, setCategory, recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();
  const setActiveConversationId = useInboxStore((state) => state.setActiveConversationId);

  // Debounce so typing doesn't fire 3 real searches per keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handle);
  }, [query]);

  const searchConversations = category === 'all' || category === 'conversations';
  const searchTickets = category === 'all' || category === 'tickets';
  const searchCustomers = category === 'all' || category === 'customers';

  const { data: conversations = [], isLoading: isLoadingConversations } = useConversationSearch(
    searchConversations ? debouncedQuery : '',
  );
  const { data: tickets = [], isLoading: isLoadingTickets } = useTicketSearch(searchTickets ? debouncedQuery : '');
  const { data: customers = [], isLoading: isLoadingCustomers } = useCustomerSearch(searchCustomers ? debouncedQuery : '');

  const isLoading =
    (searchConversations && isLoadingConversations) ||
    (searchTickets && isLoadingTickets) ||
    (searchCustomers && isLoadingCustomers);

  const results: SearchResultItem[] = [
    ...(searchConversations
      ? conversations.map((c) => ({
          id: c.id,
          type: 'conversation' as const,
          title: c.subject || 'Untitled conversation',
          subtitle: `Customer: ${c.customerName} • Status: ${c.status}`,
          link: `/conversations/${c.id}`,
        }))
      : []),
    ...(searchTickets
      ? tickets.map((t) => ({
          id: t.id,
          type: 'ticket' as const,
          title: t.subject,
          subtitle: `Priority: ${t.priority} • Status: ${t.status}`,
          link: `/tickets/${t.id}`,
        }))
      : []),
    ...(searchCustomers
      ? customers.map((c) => ({
          id: c.id,
          type: 'customer' as const,
          title: c.name,
          subtitle: c.email,
          link: `/customers/${c.id}`,
        }))
      : []),
  ];

  const handleResultClick = (item: SearchResultItem) => {
    addRecentSearch(query);
    if (item.type === 'conversation') {
      setActiveConversationId(item.id);
      router.push('/inbox');
    } else {
      router.push(item.link);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 p-6 space-y-6 overflow-y-auto" role="region" aria-label="Search page">
      {/* Search Input Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h1 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <Search className="h-5 w-5 text-primary-500" />
          <span>Global Support Search</span>
        </h1>

        <div className="relative">
          <label htmlFor="search-page-input" className="sr-only">Query search input</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            id="search-page-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type query to find customers, active tickets, message notes..."
            className="w-full rounded-md border border-neutral-200 pl-10 pr-4 py-2.5 bg-white text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-neutral-100 gap-4 text-xs font-semibold text-neutral-500">
          {(['all', 'conversations', 'tickets', 'customers'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`pb-2.5 px-1 capitalize transition border-b-2 ${
                category === cat ? 'border-primary-500 text-primary-600' : 'border-transparent hover:text-neutral-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Results list */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Search Results ({results.length})</h2>

          {query.trim() === '' ? (
            <p className="text-xs text-neutral-400 italic text-center py-8">Type search query above to load matches.</p>
          ) : isLoading ? (
            <p className="text-xs text-neutral-400 italic text-center py-8">Searching...</p>
          ) : results.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {results.map((item) => {
                const Icon = item.type === 'conversation' ? MessageSquare : item.type === 'ticket' ? Ticket : User;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleResultClick(item)}
                    className="flex justify-between items-center py-3.5 hover:bg-neutral-50 px-2 rounded-md transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-neutral-100 rounded-md flex items-center justify-center text-neutral-500">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-neutral-800 block">{item.title}</span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">{item.subtitle}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic text-center py-8">No results found matching your query.</p>
          )}
        </div>

        {/* Recent Searches Sidebar */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <History className="h-4 w-4" />
              <span>Recent Searches</span>
            </h2>
            {recentSearches.length > 0 && (
              <button onClick={clearRecentSearches} className="text-[10px] text-neutral-400 hover:text-danger font-semibold">
                Clear
              </button>
            )}
          </div>

          {recentSearches.length > 0 ? (
            <div className="space-y-2">
              {recentSearches.map((pastQ, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(pastQ)}
                  className="w-full flex items-center gap-2 text-left text-xs text-neutral-600 hover:bg-neutral-50 p-2 rounded transition"
                >
                  <span>🔍</span>
                  <span className="truncate">{pastQ}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic py-4">No recent queries.</p>
          )}
        </div>
      </div>
    </div>
  );
}
