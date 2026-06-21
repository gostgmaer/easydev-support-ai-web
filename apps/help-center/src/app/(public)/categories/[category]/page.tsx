'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCategoryArticles, useCategories } from '@/hooks/useHelpQueries';
import { BookOpen, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Spinner } from '@easydev/ui';

export default function CategoryArticlesPage() {
  const params = useParams();
  const categoryId = (params?.category as string) || '';

  const [sortOrder, setSortOrder] = React.useState<'recent' | 'alphabetical'>('recent');

  const { data: articles, isLoading } = useCategoryArticles(categoryId);
  const { data: categories } = useCategories();

  const currentCategory = React.useMemo(() => {
    return categories?.find((c) => c.id === categoryId);
  }, [categories, categoryId]);

  const sortedArticles = React.useMemo(() => {
    const list = articles ? [...articles] : [];
    if (sortOrder === 'alphabetical') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [articles, sortOrder]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-16 bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  const categoryName = currentCategory?.name || 'Category';

  return (
    <div className="space-y-5 py-4">
      <header className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/categories" className="text-neutral-400 hover:text-neutral-600 transition">
              Categories
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
            <span className="font-bold text-neutral-850">{categoryName}</span>
          </div>
          <h1 className="text-lg font-extrabold text-neutral-900">{categoryName} Guides</h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'recent' | 'alphabetical')}
            className="border border-neutral-200 rounded px-2 py-1 text-[10px] font-bold bg-white text-neutral-700 focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>
        </div>
      </header>

      {sortedArticles.length === 0 ? (
        <div className="p-8 text-center border border-neutral-200 rounded-xl bg-white space-y-2">
          <BookOpen className="h-8 w-8 text-neutral-300 mx-auto" />
          <p className="font-bold text-neutral-800">No articles in this category</p>
          <p className="text-neutral-400 text-[10px]">Check back later for tutorials or search details.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedArticles.map((art) => (
            <Link
              key={art.slug}
              href={`/articles/${art.slug}`}
              className="p-4 border border-neutral-200 hover:border-neutral-300 rounded-xl bg-white shadow-3xs flex justify-between items-center text-left transition group block"
            >
              <div className="space-y-1 pr-3 min-w-0">
                <h3 className="font-bold text-neutral-850 text-xs group-hover:text-primary-600 transition truncate leading-snug">
                  {art.title}
                </h3>
                <span className="text-[9px] text-neutral-400 font-semibold block pt-0.5">
                  Updated {new Date(art.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
