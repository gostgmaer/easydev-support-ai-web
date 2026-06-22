'use client';

import * as React from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Input, Badge, Spinner } from '@easydev/ui';
import { useFaqArticles, useArticle } from '@/hooks/useHelpQueries';

// Answer content lives on the document (loaded via chunks), not the list
// endpoint - fetch it lazily only once a question is expanded, rather than
// N+1-loading every FAQ's content up front.
function FaqAnswer({ slug }: { slug: string }) {
  const { data: article, isLoading } = useArticle(slug);
  if (isLoading) {
    return (
      <div className="px-4 pb-4 pt-1.5 flex justify-center">
        <Spinner className="h-4 w-4 text-neutral-400" />
      </div>
    );
  }
  return (
    <div className="px-4 pb-4 pt-1.5 border-t border-neutral-100/60 text-neutral-600 leading-relaxed text-[11px] font-normal whitespace-pre-wrap">
      {article?.content || 'No answer content available.'}
    </div>
  );
}

export default function FAQDatabasePage() {
  const [searchVal, setSearchVal] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [expandedSlug, setExpandedSlug] = React.useState<string | null>(null);

  const { data: faqItems = [], isLoading } = useFaqArticles();

  const categories = React.useMemo(() => {
    const names = new Set<string>();
    faqItems.forEach((f) => {
      if (f.categoryName) names.add(f.categoryName);
    });
    return ['ALL', ...Array.from(names)];
  }, [faqItems]);

  const filteredFAQs = React.useMemo(() => {
    return faqItems.filter((faq) => {
      const matchSearch = !searchVal || faq.title.toLowerCase().includes(searchVal.toLowerCase());
      const matchCategory = selectedCategory === 'ALL' || faq.categoryName === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [faqItems, searchVal, selectedCategory]);

  const toggleExpand = (slug: string) => {
    setExpandedSlug((current) => (current === slug ? null : slug));
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-16 bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Title section */}
      <div className="border-b border-neutral-100 pb-3">
        <h1 className="text-xl font-extrabold text-neutral-900">Frequently Asked Questions</h1>
        <p className="text-neutral-500 mt-1">Quick answers to common support questions.</p>
      </div>

      {/* Filter and Search controls */}
      <section className="bg-white p-5 border border-neutral-200 rounded-xl shadow-3xs space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <Input
            value={searchVal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchVal(e.target.value)}
            placeholder="Filter FAQ questions..."
            className="pl-9 text-xs h-9 bg-neutral-50/30"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 text-[10px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full font-bold border transition ${
                  selectedCategory === cat
                    ? 'bg-neutral-800 text-white border-neutral-800'
                    : 'bg-neutral-50 text-neutral-500 border-neutral-250 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* FAQ Accordion List */}
      <section className="space-y-3">
        {filteredFAQs.length === 0 ? (
          <div className="p-8 text-center border border-neutral-250 rounded-xl bg-white space-y-2">
            <HelpCircle className="h-8 w-8 text-neutral-300 mx-auto" />
            <p className="font-bold text-neutral-800">No matching FAQs found</p>
            <p className="text-neutral-400 text-[10px]">Try clearing search filters or entering different query keywords.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredFAQs.map((faq) => {
              const isOpen = expandedSlug === faq.slug;
              return (
                <div
                  key={faq.id}
                  className="border border-neutral-200 rounded-xl bg-white shadow-3xs overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(faq.slug)}
                    className="w-full px-4 py-3.5 flex justify-between items-center text-left hover:bg-neutral-50/30 transition focus:outline-none"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      {faq.categoryName && (
                        <Badge tone="neutral" className="text-[8px] uppercase tracking-wider font-bold shrink-0">
                          {faq.categoryName}
                        </Badge>
                      )}
                      <h4 className="font-bold text-neutral-800 text-xs leading-snug">{faq.title}</h4>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-neutral-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && <FaqAnswer slug={faq.slug} />}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
