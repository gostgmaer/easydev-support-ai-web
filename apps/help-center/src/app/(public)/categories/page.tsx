'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCategories } from '@/hooks/useHelpQueries';
import { useKnowledgeStore } from '@/store/knowledgeStore';
import { ArrowRight } from 'lucide-react';
import { Spinner } from '@easydev/ui';

export default function BrowseCategoriesPage() {
  const { isLoading } = useCategories();
  const categories = useKnowledgeStore((state) => state.categories);

  if (isLoading) {
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
        <p className="text-neutral-500 mt-1">Select a topic to browse its support articles.</p>
      </div>

      {categories.length === 0 ? (
        <div className="p-8 text-center border border-neutral-200 rounded-xl bg-white space-y-2">
          <p className="font-bold text-neutral-800">No categories yet</p>
          <p className="text-neutral-400 text-[10px]">Check back once knowledge base content has been published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-6 border border-neutral-200 bg-white rounded-xl shadow-3xs flex flex-col justify-between"
            >
              <div className="space-y-1">
                <h2 className="font-extrabold text-neutral-900 text-sm hover:text-primary-600 transition">
                  <Link href={`/categories/${cat.id}`}>{cat.name}</Link>
                </h2>
                <p className="text-neutral-400 text-[10px] leading-relaxed">{cat.description}</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Link
                  href={`/categories/${cat.id}`}
                  className="text-[10px] font-bold text-neutral-800 hover:text-neutral-950 flex items-center gap-1 uppercase tracking-wider transition group"
                >
                  <span>Explore Category</span>
                  <ArrowRight className="h-3 w-3 text-neutral-400 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
