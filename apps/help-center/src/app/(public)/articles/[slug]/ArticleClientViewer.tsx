'use client';

import * as React from 'react';
import Link from 'next/link';
import { useArticle, useRelatedArticles } from '@/hooks/useHelpQueries';
import {
  Calendar,
  Clock,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  FileQuestion,
} from 'lucide-react';
import { Spinner, Button, Badge } from '@easydev/ui';

export default function ArticleClientViewer({ slug }: { slug: string }) {
  const [copied, setCopied] = React.useState(false);

  const { data: article, isLoading, error } = useArticle(slug);
  const { data: related } = useRelatedArticles(slug, article?.categoryId);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-16 bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="p-8 text-center border border-neutral-200 rounded-xl bg-white space-y-2 max-w-xl mx-auto py-16">
        <FileQuestion className="h-8 w-8 text-neutral-300 mx-auto" />
        <p className="font-bold text-neutral-800">Article not found</p>
        <p className="text-neutral-400 text-[10px]">
          This guide may have been moved, unpublished, or the link is incorrect.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-4">
      {/* Article Viewer Body */}
      <article className="lg:col-span-3 space-y-6 bg-white p-6 border border-neutral-200 rounded-xl shadow-3xs">
        <header className="border-b border-neutral-100 pb-4 space-y-3">
          <div className="flex items-center gap-2">
            <Badge tone="primary">{article.categoryName || 'General'}</Badge>
            <span className="text-[10px] text-neutral-400 font-semibold">SUPPORT DOCS</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-neutral-900 leading-snug">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-[10px] text-neutral-400 font-medium pt-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readingTimeMin} min read</span>
            </div>
          </div>
        </header>

        {/* Content detail */}
        <div className="text-neutral-700 leading-relaxed whitespace-pre-wrap text-xs md:text-sm font-normal">
          {article.content}
        </div>

        {/* Feedback isn't collected by the backend yet - showing disabled
            buttons with an honest note instead of faking a submission. */}
        <div className="border-t border-neutral-100 pt-6 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="font-extrabold text-neutral-800 text-xs">Was this guide helpful to resolve your query?</p>
              <p className="text-neutral-400 text-[10px] mt-0.5">Article feedback collection isn&apos;t available yet.</p>
            </div>
            <div className="flex gap-2">
              <Button disabled variant="outline" size="sm" className="text-[10px] font-bold flex items-center gap-1 opacity-50">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Yes</span>
              </Button>
              <Button disabled variant="outline" size="sm" className="text-[10px] font-bold flex items-center gap-1 opacity-50">
                <ThumbsDown className="h-3.5 w-3.5" />
                <span>No</span>
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Sidebar options */}
      <aside className="space-y-6">
        {/* Share card */}
        <div className="border border-neutral-200 rounded-xl bg-white p-4 space-y-3 shadow-3xs">
          <h3 className="font-bold text-neutral-800 text-xs">Share Article</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyLink}
              size="sm"
              variant="outline"
              className="flex-1 text-[10px] font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
            </Button>
          </div>
        </div>

        {/* Related Articles list */}
        {related && related.length > 0 && (
          <div className="border border-neutral-200 rounded-xl bg-white p-4 space-y-3.5 shadow-3xs">
            <h3 className="font-bold text-neutral-800 text-xs">Related Guides</h3>
            <div className="space-y-3">
              {related.map((art) => (
                <Link
                  key={art.slug}
                  href={`/articles/${art.slug}`}
                  className="block text-[11px] font-bold text-neutral-700 hover:text-primary-600 transition leading-snug group block"
                >
                  <span className="group-hover:underline">{art.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
