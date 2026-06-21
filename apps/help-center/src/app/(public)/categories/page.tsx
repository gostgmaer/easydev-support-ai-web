'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCategories, useCollections } from '@/hooks/useHelpQueries';
import { useKnowledgeStore } from '@/store/knowledgeStore';
import { BookOpen, FolderClosed, ArrowRight, ChevronRight, HelpCircle } from 'lucide-react';
import { Spinner, Badge } from '@easydev/ui';

export default function BrowseCategoriesPage() {
  const { isLoading: loadingCategories } = useCategories();
  const { isLoading: loadingCollections } = useCollections();

  const categories = useKnowledgeStore((state: any) => state.categories);
  const collections = useKnowledgeStore((state: any) => state.collections);

  const fallbackCategories = [
    { id: '1', name: 'Accounts & Billing', slug: 'accounts-billing', description: 'Subscriptions, invoice retrieval, and user seats management.', articleCount: 12 },
    { id: '2', name: 'Order Tracking', slug: 'order-tracking', description: 'Shipment ETA tracking, delivery routes, and custom fees.', articleCount: 8 },
    { id: '3', name: 'Returns & Refunds', slug: 'returns-refunds', description: 'Eligibility checks, return slips, and refund timelines.', articleCount: 15 },
    { id: '4', name: 'Integrations', slug: 'integrations', description: 'Shopify connectors, webhooks setup, and API keys.', articleCount: 10 },
  ];

  const fallbackCollections = [
    { id: 'c1', name: 'Shopify Setup', slug: 'shopify-setup', description: 'Linking credentials and sync orders.', categoryId: '4', articleCount: 4 },
    { id: 'c2', name: 'Refund Inquiries', slug: 'refund-inquiries', description: 'Filing claims and checking balance.', categoryId: '3', articleCount: 7 },
  ];

  const activeCategories = categories.length === 0 ? fallbackCategories : categories;
  const activeCollections = collections.length === 0 ? fallbackCollections : collections;

  if (loadingCategories || loadingCollections) {
    return (
      <div className="h-full flex items-center justify-center py-16 bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="border-b border-neutral-100 pb-3">
        <h1 className="text-xl font-extrabold text-neutral-900">Knowledge Categories</h1>
        <p className="text-neutral-500 mt-1">Select a main topic or choose a specific sub-collection below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeCategories.map((cat: any) => {
          // Find collections belonging to this category
          const catCollections = activeCollections.filter((col: any) => col.categoryId === cat.id);

          return (
            <div
              key={cat.id}
              className="p-6 border border-neutral-200 bg-white rounded-xl shadow-3xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <header className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h2 className="font-extrabold text-neutral-900 text-sm hover:text-primary-600 transition">
                      <Link href={`/categories/${cat.slug}`}>{cat.name}</Link>
                    </h2>
                    <p className="text-neutral-400 text-[10px] leading-relaxed">{cat.description}</p>
                  </div>
                  <Badge tone="neutral" className="text-[9px] shrink-0 font-bold">
                    {cat.articleCount} DOCS
                  </Badge>
                </header>

                {/* Sub-collections links */}
                {catCollections.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block">Sub-Collections</span>
                    <div className="grid grid-cols-1 gap-2">
                      {catCollections.map((col: any) => (
                        <Link
                          key={col.id}
                          href={`/collections/${col.slug}`}
                          className="flex items-center justify-between p-2 border border-neutral-100 hover:border-neutral-200 rounded-lg hover:bg-neutral-50/50 transition group"
                        >
                          <span className="flex items-center gap-2 text-[10px] font-bold text-neutral-700 group-hover:text-primary-600">
                            <FolderClosed className="h-3.5 w-3.5 text-neutral-400 group-hover:text-primary-500" />
                            <span>{col.name}</span>
                          </span>
                          <span className="text-[9px] text-neutral-400 font-semibold">{col.articleCount} articles</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-[10px] font-bold text-neutral-800 hover:text-neutral-950 flex items-center gap-1 uppercase tracking-wider transition group"
                >
                  <span>Explore Category</span>
                  <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
