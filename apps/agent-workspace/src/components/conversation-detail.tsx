import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ExternalLink, Plus, X } from 'lucide-react';
import { ConversationHeader, Tabs, TabsList, TabsTrigger, TabsContent } from '@easydev/ui';
import { FeatureFlagGate } from '@easydev/feature-flags';
import { useInboxStore } from '../store/inboxStore';
import { useAddConversationTag, useConversationTags, useRemoveConversationTag } from '../hooks/useQueries';
import { toConversationSummary } from '../lib/ui-adapters';
import { ConversationTimeline } from './conversation-timeline';
import { MessageComposer } from './message-composer';
import { CustomerPanel } from './customer-panel';
import { TicketPanel } from './ticket-panel';
import { AiPanel } from './ai-panel';

// Lazy-loaded: only fetched when the agent actually opens the Knowledge/Workflow tab.
const KnowledgePanel = dynamic(() => import('./knowledge-panel').then((m) => m.KnowledgePanel), {
  loading: () => <div className="p-4 text-xs text-neutral-400">Loading…</div>,
});
const WorkflowPanel = dynamic(() => import('./workflow-panel').then((m) => m.WorkflowPanel), {
  loading: () => <div className="p-4 text-xs text-neutral-400">Loading…</div>,
});

export interface ConversationDetailProps {
  /** Shows a "view full conversation" link back to the standalone route - only relevant
   * when this is rendered inside the inbox's detail pane, not on the standalone page itself. */
  showOpenLink?: boolean;
}

function ConversationTags({ conversationId }: { conversationId: string }) {
  const { data: tags = [] } = useConversationTags(conversationId);
  const addTag = useAddConversationTag();
  const removeTag = useRemoveConversationTag();
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    const tag = draft.trim();
    if (!tag) return;
    addTag.mutate({ conversationId, tag });
    setDraft('');
  };

  return (
    <div className="flex items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600"
        >
          {tag}
          <button type="button" onClick={() => removeTag.mutate({ conversationId, tag })} aria-label={`Remove tag ${tag}`}>
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="Add tag"
        className="w-20 rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
      <button type="button" onClick={handleAdd} aria-label="Add tag">
        <Plus className="h-3 w-3 text-neutral-400" />
      </button>
    </div>
  );
}

export function ConversationDetail({ showOpenLink = false }: ConversationDetailProps) {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const activeConversation = useInboxStore((state) =>
    state.conversations.find((c) => c.id === state.activeConversationId),
  );

  if (!activeConversationId || !activeConversation) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        Select a conversation to get started.
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <ConversationHeader
        conversation={toConversationSummary(activeConversation)}
        actions={
          <>
            <ConversationTags conversationId={activeConversationId} />
            {showOpenLink && (
              <Link
                href={`/conversations/${activeConversationId}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
              >
                Open <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </>
        }
      />

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-1 min-w-0 flex-col">
          <ConversationTimeline />
          <MessageComposer />
        </div>

        <div className="w-80 shrink-0 border-l border-neutral-200 overflow-y-auto">
          <Tabs defaultValue="customer">
            <TabsList className="m-2">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="ticket">Ticket</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
            </TabsList>
            <TabsContent value="customer">
              <CustomerPanel />
            </TabsContent>
            <TabsContent value="ticket">
              <TicketPanel />
            </TabsContent>
            <TabsContent value="ai">
              <AiPanel />
            </TabsContent>
            <TabsContent value="knowledge">
              <FeatureFlagGate flag="knowledge_base.enabled">
                <KnowledgePanel />
              </FeatureFlagGate>
            </TabsContent>
            <TabsContent value="workflow">
              <FeatureFlagGate flag="workflow_orchestration.enabled">
                <WorkflowPanel />
              </FeatureFlagGate>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
