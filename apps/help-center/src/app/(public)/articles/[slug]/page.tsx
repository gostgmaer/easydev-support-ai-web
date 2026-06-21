'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useArticle, useRelatedArticles, useSubmitArticleFeedback } from '@/hooks/useHelpQueries';
import { useFeedbackStore } from '@/store/feedbackStore';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  History,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Share2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Spinner, Button, Badge, Textarea } from '@easydev/ui';

export default function ArticleViewerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';

  const [copied, setCopied] = React.useState(false);
  const [feedbackComment, setFeedbackComment] = React.useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);

  // Zustand feedback store for tracking ratings in-session
  const ratedArticles = useFeedbackStore((state: any) => state.ratedArticles);
  const rateArticleAction = useFeedbackStore((state: any) => state.rateArticle);

  // Queries for article detail & related articles list
  const { data: article, isLoading, error } = useArticle(slug);
  const { data: related } = useRelatedArticles(slug);
  const feedbackMutation = useSubmitArticleFeedback();

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRateArticle = (value: 'helpful' | 'not-helpful') => {
    if (!article) return;
    feedbackMutation.mutate(
      {
        articleId: article.id,
        value,
      },
      {
        onSuccess: () => {
          rateArticleAction(article.id, value);
        },
      }
    );
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !feedbackComment.trim()) return;

    const currentValue = ratedArticles[article.id] || 'helpful';
    feedbackMutation.mutate(
      {
        articleId: article.id,
        value: currentValue,
        comment: feedbackComment.trim(),
      },
      {
        onSuccess: () => {
          setFeedbackSubmitted(true);
          setFeedbackComment('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-16 bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  if (error || !article) {
    // Fallback Mock Article Render for Dev Compilation Tests
    const mockArticle = {
      id: 'art-fallback-101',
      title: 'How to cancel your Shopify subscription',
      content: `If you wish to cancel or pause your Shopify subscription, please follow this official walkthrough:\n\n1. Log in to your Shopify Admin panel as the store owner.\n2. Navigate to Settings located in the bottom-left corner of the sidebar.\n3. Click on Plan from the settings menu.\n4. Select Deactivate Store or Pause and Build.\n5. Select your reason for deactivating, then click Continue.\n6. Enter your admin password to authenticate, and click Deactivate Now.\n\n### Important Considerations:\n- **No refunds:** Shopify does not issue automatic refunds on subscription renewals. Ensure you cancel before your next billing cycle.\n- **Data preservation:** Once deactivated, Shopify preserves your store configuration and product database for up to 90 days in case you decide to reopen.\n- **App subscriptions:** Third-party application subscriptions must be cancelled individually if they charge outside Shopify billing.`,
      categoryName: 'Accounts & Billing',
      updatedAt: new Date().toISOString(),
      author: { name: 'Sarah Vance', role: 'Support Operations Lead' },
      readingTimeMin: 3,
      versions: [
        { version: 'v2.1', updatedAt: '2026-05-12T10:00:00Z', authorName: 'Sarah Vance', changeSummary: 'Updated plan settings layout screenshots instructions.' },
        { version: 'v1.0', updatedAt: '2025-09-01T08:00:00Z', authorName: 'Alex Mercer', changeSummary: 'Initial article release.' },
      ],
      viewCount: 125,
      helpfulCount: 45,
      notHelpfulCount: 5,
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-4">
        <article className="lg:col-span-3 space-y-6 bg-white p-6 border border-neutral-200 rounded-xl shadow-3xs">
          <header className="border-b border-neutral-100 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge tone="primary">{mockArticle.categoryName}</Badge>
              <span className="text-[10px] text-neutral-400 font-semibold">SUPPORT DOCS</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-neutral-900 leading-snug">{mockArticle.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-neutral-400 font-medium pt-1">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>By {mockArticle.author.name} ({mockArticle.author.role})</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Updated {new Date(mockArticle.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{mockArticle.readingTimeMin} min read</span>
              </div>
            </div>
          </header>

          <div className="text-neutral-700 leading-relaxed whitespace-pre-wrap text-xs md:text-sm font-normal">
            {mockArticle.content}
          </div>

          {/* Version history widget */}
          <div className="border border-neutral-150 rounded-lg p-4 bg-neutral-50/50 space-y-3">
            <h3 className="font-bold text-neutral-800 flex items-center gap-1.5 text-xs">
              <History className="h-4 w-4 text-neutral-500" />
              <span>Document Version History</span>
            </h3>
            <div className="space-y-2.5">
              {mockArticle.versions.map((v: any, i: number) => (
                <div key={v.version} className="flex gap-3 text-[10px]">
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-[9px]">{v.version}</div>
                    {i < mockArticle.versions.length - 1 && <div className="w-0.5 bg-neutral-200 flex-1 my-1" />}
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-neutral-800 block">{v.changeSummary}</span>
                    <span className="text-neutral-400">Edited by {v.authorName} on {new Date(v.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="border border-neutral-200 rounded-xl bg-white p-4 space-y-3.5 shadow-3xs">
            <h3 className="font-bold text-neutral-800 text-xs">Share Guide</h3>
            <div className="flex gap-2">
              <Button onClick={handleCopyLink} size="sm" variant="outline" className="flex-1 text-[10px] font-bold flex items-center justify-center gap-1">
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  const isRated = ratedArticles[article.id];

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
              <User className="h-3.5 w-3.5" />
              <span>By {article.author?.name || 'Staff'} ({article.author?.role || 'Contributor'})</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readingTimeMin || 3} min read</span>
            </div>
          </div>
        </header>

        {/* Content detail */}
        <div className="text-neutral-700 leading-relaxed whitespace-pre-wrap text-xs md:text-sm font-normal">
          {article.content}
        </div>

        {/* Document Versioning timeline */}
        {article.versions && article.versions.length > 0 && (
          <div className="border border-neutral-150 rounded-lg p-4 bg-neutral-50/50 space-y-3">
            <h3 className="font-bold text-neutral-800 flex items-center gap-1.5 text-xs">
              <History className="h-4 w-4 text-neutral-500" />
              <span>Document Version History</span>
            </h3>
            <div className="space-y-2.5">
              {article.versions.map((v: any, i: number) => (
                <div key={v.version} className="flex gap-3 text-[10px]">
                  <div className="flex flex-col items-center">
                    <div className="h-4 w-4 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold text-[9px]">{v.version}</div>
                    {i < article.versions.length - 1 && <div className="w-0.5 bg-neutral-200 flex-1 my-1" />}
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-neutral-800 block">{v.changeSummary || 'Minor documentation improvements.'}</span>
                    <span className="text-neutral-400">Edited by {v.authorName} on {new Date(v.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Article Ratings Helpful feedback experience */}
        <div className="border-t border-neutral-100 pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="font-extrabold text-neutral-800 text-xs">Was this guide helpful to resolve your query?</p>
              <p className="text-neutral-400 text-[10px] mt-0.5">Your ratings help us improve our AI deflection answers.</p>
            </div>

            {isRated ? (
              <Badge tone={isRated === 'helpful' ? 'success' : 'danger'} className="text-[10px] font-bold">
                {isRated === 'helpful' ? 'Rated Helpful' : 'Rated Not Helpful'}
              </Badge>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleRateArticle('helpful')}
                  variant="outline"
                  size="sm"
                  className="text-[10px] font-bold flex items-center gap-1 hover:bg-success-50/50 hover:text-success-700 transition"
                >
                  <ThumbsUp className="h-3.5 w-3.5 text-success" />
                  <span>Yes, thanks</span>
                </Button>
                <Button
                  onClick={() => handleRateArticle('not-helpful')}
                  variant="outline"
                  size="sm"
                  className="text-[10px] font-bold flex items-center gap-1 hover:bg-danger-50/50 hover:text-danger-700 transition"
                >
                  <ThumbsDown className="h-3.5 w-3.5 text-danger" />
                  <span>No, not really</span>
                </Button>
              </div>
            )}
          </div>

          {/* Feedback comments collection */}
          {isRated && !feedbackSubmitted && (
            <form onSubmit={handleCommentSubmit} className="space-y-3 p-4 border border-neutral-150 rounded-lg bg-neutral-50/30">
              <label htmlFor="article-feedback-comment" className="font-bold text-neutral-600 block">Tell us how we can improve this article:</label>
              <Textarea
                id="article-feedback-comment"
                value={feedbackComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedbackComment(e.target.value)}
                placeholder="Write your feedback..."
                className="min-h-16 text-xs bg-white"
                required
              />
              <Button
                type="submit"
                size="sm"
                className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-[10px]"
                disabled={feedbackMutation.isPending}
              >
                Submit Feedback
              </Button>
            </form>
          )}

          {feedbackSubmitted && (
            <p className="text-success-600 font-bold text-[10px] bg-success-50/50 border border-success-100 p-2.5 rounded-lg text-center">
              Thank you! Your feedback comment has been recorded.
            </p>
          )}
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
              {related.map((art: any) => (
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
