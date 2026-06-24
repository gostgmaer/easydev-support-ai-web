'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCategories, useRecentArticles, useAskHelpAI, useSubmitAiDeflectionFeedback } from '@/hooks/useHelpQueries';
import { useAIHelpStore } from '@/store/aiHelpStore';
import {
  Search,
  BookOpen,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  Bot,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Input, Button, Badge, Spinner } from '@easydev/ui';

export default function PublicHomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [aiQuery, setAiQuery] = React.useState('');
  const [feedbackGiven, setFeedbackGiven] = React.useState(false);

  const { data: categories = [], isLoading: loadingCategories, isError: categoriesFailed } = useCategories();
  const { data: recentArticles = [], isLoading: loadingArticles, isError: articlesFailed } = useRecentArticles(3);

  const chatHistory = useAIHelpStore((state) => state.chatHistory);
  const isAskingAI = useAIHelpStore((state) => state.isAskingAI);
  const suggestedQuestions = useAIHelpStore((state) => state.suggestedQuestions);
  const escalationTriggered = useAIHelpStore((state) => state.escalationTriggered);
  const askAIMutation = useAskHelpAI();
  const deflectionFeedbackMutation = useSubmitAiDeflectionFeedback();

  const lastAnswer = chatHistory.filter((m) => m.sender === 'assistant').slice(-1)[0];
  const lastResult = askAIMutation.data;

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAskingAI) return;
    setFeedbackGiven(false);
    askAIMutation.mutate(
      { query: aiQuery.trim(), sessionId: lastResult?.sessionId },
      { onSuccess: () => setAiQuery('') },
    );
  };

  const handleDeflectionFeedback = (resolved: boolean) => {
    if (!lastResult) return;
    deflectionFeedbackMutation.mutate(
      { sessionId: lastResult.sessionId, resolved, documentId: lastResult.sources[0]?.id },
      { onSuccess: () => setFeedbackGiven(true) },
    );
  };

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
        ) : categoriesFailed ? (
          <p className="text-center text-danger-600 text-xs py-8">Couldn&apos;t load categories. Please try again later.</p>
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
          ) : articlesFailed ? (
            <p className="text-danger-600 text-xs py-8 text-center">Couldn&apos;t load recent articles. Please try again later.</p>
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

      {/* 4. Ask AI Copilot */}
      <section className="border border-neutral-200 bg-white rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center shrink-0">
            <Bot className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-neutral-900 text-xs">Ask AI Copilot</h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Get an instant AI-generated answer drawn from our knowledge base.
            </p>
          </div>
        </div>

        <form onSubmit={handleAskAI} className="flex gap-2">
          <Input
            value={aiQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAiQuery(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 text-xs"
            disabled={isAskingAI}
          />
          <Button type="submit" disabled={isAskingAI || !aiQuery.trim()} className="text-xs font-bold px-4">
            {isAskingAI ? <Spinner className="h-3.5 w-3.5" /> : 'Ask'}
          </Button>
        </form>

        {suggestedQuestions.length > 0 && chatHistory.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAiQuery(q)}
                className="text-[10px] font-semibold text-neutral-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-full px-2.5 py-1"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {lastAnswer && (
          <div className="border-t border-neutral-100 pt-4 space-y-3">
            <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">{lastAnswer.content}</p>

            {lastResult && lastResult.sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {lastResult.sources.map((src) => (
                  <Link
                    key={src.id}
                    href={`/articles/${src.slug}`}
                    className="text-[10px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 border border-primary-100 rounded px-2 py-0.5"
                  >
                    {src.title}
                  </Link>
                ))}
              </div>
            )}

            {escalationTriggered && !feedbackGiven && (
              <div className="flex items-center justify-between gap-3 bg-neutral-50 border border-neutral-100 rounded-lg p-3">
                <p className="text-[10px] text-neutral-500">Did this resolve your question?</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeflectionFeedback(true)}
                    className="text-[10px] font-bold flex items-center gap-1"
                  >
                    <ThumbsUp className="h-3 w-3" /> Yes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeflectionFeedback(false)}
                    className="text-[10px] font-bold flex items-center gap-1"
                  >
                    <ThumbsDown className="h-3 w-3" /> No
                  </Button>
                </div>
              </div>
            )}

            {feedbackGiven && deflectionFeedbackMutation.data && (
              <p className="text-[10px] font-semibold text-success">{deflectionFeedbackMutation.data.message}</p>
            )}

            {escalationTriggered && (
              <Link
                href="/contact-support"
                className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <span>Still need help? Contact support</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
