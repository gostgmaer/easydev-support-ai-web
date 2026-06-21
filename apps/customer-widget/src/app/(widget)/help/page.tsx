'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWidgetStore } from '../../../store/widgetStore';
import { useKnowledgeArticles, useSuggestedArticles } from '../../../hooks/useWidgetQueries';
import { ArrowLeft, BookOpen, Search, X, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { Spinner, Input, Button, Badge } from '@easydev/ui';
import type { HelpArticle } from '../../../store/widgetStore';

export default function WidgetHelpPage() {
  const router = useRouter();
  const config = useWidgetStore((state) => state.config);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [selectedArticle, setSelectedArticle] = React.useState<HelpArticle | null>(null);

  // Debounce search query to prevent excessive API calls
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load knowledge articles
  const { data: searchResults, isFetching: isSearching } = useKnowledgeArticles(debouncedQuery);
  const { data: suggestedArticles, isLoading: isLoadingSuggested } = useSuggestedArticles();

  const handleSelectArticle = (art: HelpArticle) => {
    setSelectedArticle(art);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  return (
    <div className="h-full flex flex-col justify-between bg-neutral-50/50 text-xs relative overflow-hidden">
      {/* Header bar */}
      <div className="h-9 px-3 border-b border-neutral-100 bg-white flex items-center justify-between z-10 shrink-0">
        {selectedArticle ? (
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 font-semibold focus:outline-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Help</span>
          </button>
        ) : (
          <button
            onClick={() => router.push('/widget')}
            className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 font-semibold focus:outline-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        )}
        <span className="font-bold text-neutral-800">Knowledge Base</span>
      </div>

      {/* Main Body viewport */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-neutral-50/30 relative">
        {selectedArticle ? (
          /* Article Viewer Mode */
          <article className="p-5 bg-white h-full overflow-y-auto space-y-4">
            <header className="border-b border-neutral-100 pb-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge tone="success">HELP ARTICLE</Badge>
                <span className="text-[10px] text-neutral-400 font-medium">Updated recently</span>
              </div>
              <h1 className="text-sm font-bold text-neutral-900 leading-snug">{selectedArticle.title}</h1>
            </header>
            <div className="text-neutral-700 leading-relaxed whitespace-pre-wrap text-[11px] font-normal">
              {selectedArticle.content}
            </div>
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <p className="font-bold text-neutral-800">Was this article helpful?</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-[10px] font-bold">Yes, thanks!</Button>
                <Button size="sm" variant="outline" className="text-[10px] font-bold">Not really</Button>
              </div>
            </div>
          </article>
        ) : (
          /* Search & List Mode */
          <div className="p-4 space-y-5">
            {/* Search Input Container */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <Input
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search tutorials, FAQs, and policies..."
                className="pl-9 pr-8 text-xs h-9 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Loading Indicator */}
            {isSearching ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-5 w-5 text-neutral-400" />
              </div>
            ) : searchQuery.length > 1 ? (
              /* Search Results */
              <div className="space-y-3">
                <h3 className="font-bold text-neutral-500 uppercase tracking-wider text-[9px]">Search Results</h3>
                {(!searchResults || searchResults.length === 0) ? (
                  <div className="p-6 text-center border border-neutral-150 rounded-lg bg-white space-y-2">
                    <HelpCircle className="h-8 w-8 text-neutral-300 mx-auto" />
                    <p className="font-bold text-neutral-800">No results found</p>
                    <p className="text-neutral-400 max-w-[200px] mx-auto text-[10px]">Try using different keywords or search for our refund/billing tutorials.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => handleSelectArticle(art)}
                        className="w-full p-3 border border-neutral-200 hover:border-neutral-300 rounded-lg bg-white shadow-3xs flex items-center justify-between text-left group transition"
                      >
                        <div className="space-y-1 pr-2 min-w-0">
                          <h4 className="font-bold text-neutral-800 truncate text-[11px] group-hover:text-primary-600 transition">{art.title}</h4>
                          <p className="text-[10px] text-neutral-400 truncate">{art.content}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Suggested FAQs & Quick Guides */
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-neutral-500 uppercase tracking-wider text-[9px]">Suggested Articles</h3>
                  {isLoadingSuggested ? (
                    <div className="flex justify-center py-4">
                      <Spinner className="h-4 w-4 text-neutral-400" />
                    </div>
                  ) : (!suggestedArticles || suggestedArticles.length === 0) ? (
                    // Fallback recommended list to prevent empty screens
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelectArticle({
                          id: 'faq-refunds',
                          title: 'How do I request a refund?',
                          content: 'To request a refund, please follow these simple steps:\n1. Log in to your Customer Portal.\n2. Navigate to your Order History.\n3. Click the Request Refund button next to your eligible order.\n4. Complete the brief reason form and submit.\n\nRefunds typically take 5-10 business days to process depending on your financial institution.',
                        })}
                        className="w-full p-3 border border-neutral-200 rounded-lg bg-white flex items-center justify-between text-left hover:border-neutral-350 transition group"
                      >
                        <span className="font-bold text-neutral-800 text-[11px] group-hover:text-primary-600">How do I request a refund?</span>
                        <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition shrink-0" />
                      </button>

                      <button
                        onClick={() => handleSelectArticle({
                          id: 'faq-shipping',
                          title: 'Shipping and Delivery Timelines',
                          content: 'We offer standard and expedited shipping options:\n- Standard Shipping: 3-5 business days.\n- Expedited Shipping: 1-2 business days.\n\nAll orders are processed and shipped within 24 hours of placement. Tracking information is sent via email as soon as the package leaves our warehouse.',
                        })}
                        className="w-full p-3 border border-neutral-200 rounded-lg bg-white flex items-center justify-between text-left hover:border-neutral-350 transition group"
                      >
                        <span className="font-bold text-neutral-800 text-[11px] group-hover:text-primary-600">Shipping and Delivery Timelines</span>
                        <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition shrink-0" />
                      </button>

                      <button
                        onClick={() => handleSelectArticle({
                          id: 'faq-cancel',
                          title: 'Can I cancel my Shopify order?',
                          content: 'Orders can only be cancelled within 60 minutes of purchase. To cancel your order:\n1. Find the order confirmation email.\n2. Click the Manage Order link.\n3. If your order is within the eligible window, you will see a Cancel Order option.\n\nIf the cancel option is not visible, it means the order has already entered our fulfillment pipeline and cannot be cancelled. In that case, you can initiate a return once the package arrives.',
                        })}
                        className="w-full p-3 border border-neutral-200 rounded-lg bg-white flex items-center justify-between text-left hover:border-neutral-350 transition group"
                      >
                        <span className="font-bold text-neutral-800 text-[11px] group-hover:text-primary-600">Can I cancel my Shopify order?</span>
                        <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition shrink-0" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {suggestedArticles.map((art) => (
                        <button
                          key={art.id}
                          onClick={() => handleSelectArticle(art)}
                          className="w-full p-3 border border-neutral-200 hover:border-neutral-300 rounded-lg bg-white shadow-3xs flex items-center justify-between text-left group transition"
                        >
                          <span className="font-bold text-neutral-800 text-[11px] group-hover:text-primary-600 transition">{art.title}</span>
                          <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
