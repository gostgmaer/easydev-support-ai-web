'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCategories, useRecentArticles } from '@/hooks/useHelpQueries';
import {
  Search,
  BookOpen,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  Bot,
} from 'lucide-react';
import { Input, Button, Badge, Spinner } from '@easydev/ui';

export default function PublicHomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: recentArticles = [], isLoading: loadingArticles } = useRecentArticles(3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-12 py-4">
      {/* 1. Hero Search section */}
      <section className="text-center py-10 px-4 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 text-white rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <Badge tone="primary" className="bg-white/10 text-white border-transparent">
            SELF SERVICE PORTAL
          </Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">How can we help you today?</h1>
          <p className="text-neutral-300 text-xs md:text-sm max-w-lg mx-auto">
            Search our knowledge base for guides, tutorials, and answers.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search guides, tutorials, FAQ answers..."
              className="pl-11 pr-24 h-12 text-sm text-neutral-900 bg-white border-transparent rounded-lg focus:ring-2 focus:ring-primary-500 w-full"
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1.5 h-9 bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold px-4 rounded"
            >
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* 2. Grid categories section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-neutral-100 pb-2">
          <h2 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">Browse by Category</h2>
          <Link href="/categories" className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loadingCategories ? (
          <div className="flex justify-center py-8"><Spinner className="h-5 w-5 text-neutral-400" /></div>
        ) : categories.length === 0 ? (
          <p className="text-center text-neutral-400 text-xs py-8">No categories published yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="p-5 border border-neutral-200 bg-white hover:border-neutral-300 rounded-xl shadow-3xs transition hover:-translate-y-0.5 duration-200 block group"
              >
                <div className="h-9 w-9 bg-neutral-50 text-neutral-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neutral-900 group-hover:text-white transition">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-neutral-900 group-hover:text-primary-600 transition text-xs mb-1">
                  {cat.name}
                </h3>
                <p className="text-neutral-400 text-[10px] leading-relaxed mb-3 line-clamp-2">
                  {cat.description}
                </p>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <span>View Articles</span>
                  <ChevronRight className="h-3 w-3 text-neutral-300 group-hover:translate-x-0.5 transition" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Recent articles & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-extrabold text-neutral-900 border-b border-neutral-100 pb-2 uppercase tracking-wider">
            Recently Updated Articles
          </h2>
          {loadingArticles ? (
            <div className="flex justify-center py-8"><Spinner className="h-5 w-5 text-neutral-400" /></div>
          ) : recentArticles.length === 0 ? (
            <p className="text-neutral-400 text-xs py-8 text-center">No published articles yet.</p>
          ) : (
            <div className="space-y-3.5">
              {recentArticles.map((art) => (
                <Link
                  key={art.slug}
                  href={`/articles/${art.slug}`}
                  className="p-4 border border-neutral-200 rounded-xl bg-white hover:border-neutral-300 shadow-3xs flex justify-between items-start gap-4 transition group block"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-neutral-850 text-xs group-hover:text-primary-600 transition leading-snug">
                      {art.title}
                    </h3>
                    {art.categoryName && (
                      <p className="text-neutral-400 text-[10px] leading-relaxed">{art.categoryName}</p>
                    )}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-600 transition shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-extrabold text-neutral-900 border-b border-neutral-100 pb-2 uppercase tracking-wider">
            Support Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/contact-support"
              className="p-4 border border-neutral-200 hover:border-primary-300 rounded-xl flex items-center gap-3.5 bg-white shadow-3xs transition hover:-translate-y-0.5 duration-200 block"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-neutral-50 text-neutral-600 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-neutral-800 block text-xs">Submit a Support Ticket</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Route requests to active agents</span>
                </div>
              </div>
            </Link>

            <Link
              href="/faq"
              className="p-4 border border-neutral-200 hover:border-primary-300 rounded-xl flex items-center gap-3.5 bg-white shadow-3xs transition hover:-translate-y-0.5 duration-200 block"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-neutral-50 text-neutral-600 rounded-lg flex items-center justify-center shrink-0">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-neutral-800 block text-xs">Browse FAQs</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Instantly resolve recurring issues</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>

      {/* 4. Ask AI - not yet available (no conversational AI endpoint exists
          for anonymous Help Center visitors; only Search hits real data) */}
      <section className="border border-neutral-200 bg-white rounded-2xl p-6 shadow-xs flex items-center gap-4">
        <div className="h-10 w-10 bg-neutral-100 text-neutral-400 rounded-lg flex items-center justify-center shrink-0">
          <Bot className="h-5.5 w-5.5" />
        </div>
        <div>
          <h3 className="font-extrabold text-neutral-700 text-xs flex items-center gap-1.5">
            <span>Ask AI Copilot</span>
            <Badge tone="neutral" className="text-[9px] uppercase tracking-wider font-bold">Coming Soon</Badge>
          </h3>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            Conversational AI assistance isn&apos;t available yet - try Search above in the meantime.
          </p>
        </div>
      </section>
    </div>
  );
}
