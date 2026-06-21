'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCategories, useAskAIAssistant } from '@/hooks/useHelpQueries';
import { useKnowledgeStore } from '@/store/knowledgeStore';
import { useAIHelpStore } from '@/store/aiHelpStore';
import {
  Search,
  BookOpen,
  MessageSquare,
  Ticket,
  Bot,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ArrowRightLeft,
  ChevronRight,
  Send,
  Loader2 as LucideSpinner,
  HelpCircle,
} from 'lucide-react';
import { Input, Button, Badge } from '@easydev/ui';

export default function PublicHomePage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [aiMessage, setAIMessage] = React.useState('');

  // Load categories
  const { isLoading: loadingCategories } = useCategories();
  const categories = useKnowledgeStore((state: any) => state.categories);

  // Ask AI state & mutation
  const askAIMutation = useAskAIAssistant();
  const chatHistory = useAIHelpStore((state: any) => state.chatHistory);
  const isAskingAI = useAIHelpStore((state: any) => state.isAskingAI);
  const clearAIChat = useAIHelpStore((state: any) => state.clearAIChat);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAskAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim() || isAskingAI) return;
    askAIMutation.mutate(aiMessage.trim(), {
      onSuccess: () => {
        setAIMessage('');
      },
    });
  };

  // Standard fallback lists if backend returns empty lists
  const fallbackCategories = [
    { name: 'Accounts & Billing', slug: 'accounts-billing', description: 'Subscriptions, invoice retrieval, and user seats management.', icon: BookOpen, articleCount: 12 },
    { name: 'Order Tracking', slug: 'order-tracking', description: 'Shipment ETA tracking, delivery routes, and custom fees.', icon: TrendingUp, articleCount: 8 },
    { name: 'Returns & Refunds', slug: 'returns-refunds', description: 'Eligibility checks, return slips, and refund timelines.', icon: ArrowRightLeft, articleCount: 15 },
    { name: 'Integrations', slug: 'integrations', description: 'Shopify connectors, webhooks setup, and API keys.', icon: Award, articleCount: 10 },
  ];

  const popularArticles = [
    { title: 'How to cancel your Shopify subscription', slug: 'how-to-cancel-shopify-subscription', excerpt: 'Step-by-step tutorial explaining how to disable renewals and billing.' },
    { title: 'Standard vs Expedited shipping timelines', slug: 'standard-vs-expedited-shipping-timelines', excerpt: 'Compare estimated arrival dates and warehouse fulfillment priorities.' },
    { title: 'Filing custom returns slip request', slug: 'filing-custom-returns-slip-request', excerpt: 'Learn how to generate a postage-paid PDF return label for returns.' },
  ];

  const displayCategories = categories.length === 0 ? fallbackCategories : categories;

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
            Search our comprehensive knowledge base or chat with our real-time AI copilot.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayCategories.map((cat: any) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
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
                <span>{cat.articleCount || 0} Articles</span>
                <ChevronRight className="h-3 w-3 text-neutral-300 group-hover:translate-x-0.5 transition" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Popular articles & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-extrabold text-neutral-900 border-b border-neutral-100 pb-2 uppercase tracking-wider">
            Popular Support Articles
          </h2>
          <div className="space-y-3.5">
            {popularArticles.map((art) => (
              <Link
                key={art.slug}
                href={`/articles/${art.slug}`}
                className="p-4 border border-neutral-200 rounded-xl bg-white hover:border-neutral-300 shadow-3xs flex justify-between items-start gap-4 transition group block"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-neutral-850 text-xs group-hover:text-primary-600 transition leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-neutral-400 text-[10px] leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-600 transition shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
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

      {/* 4. Ask AI Chat section */}
      <section className="border border-neutral-200 bg-white rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-neutral-900 text-white rounded-lg flex items-center justify-center shadow-3xs">
              <Bot className="h-5.5 w-5.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
                <span>Ask AI Copilot</span>
                <Badge tone="warning" className="text-[9px] uppercase tracking-wider font-bold">
                  Instant Deflection
                </Badge>
              </h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">Get immediate recommendations from our support assistant.</p>
            </div>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={clearAIChat}
              className="text-[10px] text-neutral-400 hover:text-neutral-600 font-bold focus:outline-none"
            >
              Reset Chat
            </button>
          )}
        </div>

        {/* AI chat timelines */}
        <div className="space-y-4 max-h-72 overflow-y-auto px-1">
          {chatHistory.length === 0 ? (
            <div className="text-center py-6 text-neutral-400 space-y-2">
              <Sparkles className="h-6 w-6 text-neutral-300 mx-auto" />
              <p className="font-semibold text-neutral-700 text-xs">No active conversation</p>
              <p className="text-[10px] text-neutral-400 max-w-[240px] mx-auto">Ask a question below, and AI will provide instant answers and recommend relevant guides.</p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {chatHistory.map((msg: any) => {
                const isAI = msg.sender === 'assistant';
                return (
                  <div key={msg.id} className={`flex gap-3 ${!isAI ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${isAI ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                      {isAI ? <Bot className="h-4 w-4" /> : <TrendingUp className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`max-w-[75%] p-3.5 rounded-lg space-y-2.5 ${isAI ? 'bg-neutral-50 text-neutral-800' : 'bg-neutral-850 text-white'}`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      
                      {/* Recommendations display */}
                      {isAI && msg.recommendedArticles && msg.recommendedArticles.length > 0 && (
                        <div className="border-t border-neutral-200/60 pt-2 space-y-1.5 shrink-0">
                          <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-500 block">Recommended Articles</span>
                          {msg.recommendedArticles.map((art: any) => (
                            <Link
                              key={art.slug}
                              href={`/articles/${art.slug}`}
                              className="text-primary-600 hover:text-primary-700 font-bold block text-[10px] leading-tight"
                            >
                              &bull; {art.title}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Confidence Score bar */}
                      {isAI && msg.confidenceScore !== undefined && (
                        <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 font-semibold pt-1 border-t border-neutral-200/40">
                          <span>AI Confidence:</span>
                          <span className={`${msg.confidenceScore > 0.8 ? 'text-success-600' : 'text-warning-600'}`}>
                            {Math.round(msg.confidenceScore * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI chat text composer */}
        <form onSubmit={handleAskAISubmit} className="flex gap-2">
          <label htmlFor="ai-chat-input" className="sr-only">Ask AI a question</label>
          <Input
            id="ai-chat-input"
            value={aiMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAIMessage(e.target.value)}
            placeholder="Type a query (e.g. How do I change my delivery address?)..."
            className="flex-1 text-xs bg-neutral-50/50"
            disabled={isAskingAI}
          />
          <Button
            type="submit"
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-4 flex items-center gap-1"
            disabled={!aiMessage.trim() || isAskingAI}
          >
            {isAskingAI ? (
              <LucideSpinner className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                <span>Ask AI</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>
      </section>
    </div>
  );
}
