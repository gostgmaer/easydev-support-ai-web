'use client';

import React, { useState } from 'react';
import { InboxList } from '../../../components/inbox-list';
import { ConversationTimeline } from '../../../components/conversation-timeline';
import { MessageComposer } from '../../../components/message-composer';
import { CustomerPanel } from '../../../components/customer-panel';
import { TicketPanel } from '../../../components/ticket-panel';
import { AiPanel } from '../../../components/ai-panel';
import { KnowledgePanel } from '../../../components/knowledge-panel';
import { useInboxStore } from '../../../store/inboxStore';
import { useConversations, useMyAgentProfile } from '../../../hooks/useQueries';
import { User, Ticket, Sparkles, BookOpen } from 'lucide-react';

export default function InboxPage() {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const selectedView = useInboxStore((state) => state.selectedView);
  const filters = useInboxStore((state) => state.filters);
  const [activeTab, setActiveTab] = useState<'customer' | 'ticket' | 'ai' | 'knowledge'>('ai');

  const { data: agentProfile } = useMyAgentProfile();
  const teamId = agentProfile?.teamIds[0] ?? null;
  const { isLoading, isError, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useConversations(selectedView, filters, teamId);

  return (
    <div className="flex h-full w-full bg-neutral-100 overflow-hidden" role="region" aria-label="Unified Inbox Workspace">
      {/* Left panel: Conversations stream */}
      <div className="w-80 border-r border-neutral-200 bg-white flex-shrink-0 flex flex-col h-full">
        <InboxList
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          hasMore={hasNextPage}
          isFetchingMore={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
        />
      </div>

      {/* Middle panel: Message Timeline & Input Composer */}
      <div className="flex-1 flex flex-col min-w-0 bg-white h-full relative">
        <ConversationTimeline />
        <MessageComposer />
      </div>

      {/* Right panel: Collapsible Context Tabs */}
      {activeConversationId && (
        <div className="w-96 border-l border-neutral-200 bg-white flex-shrink-0 flex flex-col h-full" role="tablist" aria-label="Context sidebar info">
          {/* Tabs Navigation */}
          <div className="flex border-b border-neutral-200 bg-neutral-50 p-1 gap-1">
            <button
              onClick={() => setActiveTab('ai')}
              role="tab"
              aria-selected={activeTab === 'ai'}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 text-xs font-bold rounded-md transition ${
                activeTab === 'ai'
                  ? 'bg-white border border-neutral-200 text-primary-600 shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Sparkles className="h-4 w-4 text-cyan-500 animate-pulse" />
              <span>AI Copilot</span>
            </button>

            <button
              onClick={() => setActiveTab('customer')}
              role="tab"
              aria-selected={activeTab === 'customer'}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 text-xs font-bold rounded-md transition ${
                activeTab === 'customer'
                  ? 'bg-white border border-neutral-200 text-primary-600 shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <User className="h-4 w-4 text-neutral-400" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => setActiveTab('ticket')}
              role="tab"
              aria-selected={activeTab === 'ticket'}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 text-xs font-bold rounded-md transition ${
                activeTab === 'ticket'
                  ? 'bg-white border border-neutral-200 text-primary-600 shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Ticket className="h-4 w-4 text-neutral-400" />
              <span>Ticket</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              role="tab"
              aria-selected={activeTab === 'knowledge'}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 text-xs font-bold rounded-md transition ${
                activeTab === 'knowledge'
                  ? 'bg-white border border-neutral-200 text-primary-600 shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <BookOpen className="h-4 w-4 text-neutral-400" />
              <span>Docs</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="flex-1 overflow-hidden" role="tabpanel">
            {activeTab === 'ai' && <AiPanel />}
            {activeTab === 'customer' && <CustomerPanel />}
            {activeTab === 'ticket' && <TicketPanel />}
            {activeTab === 'knowledge' && <KnowledgePanel />}
          </div>
        </div>
      )}
    </div>
  );
}
