import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CheckCircle2, ExternalLink, Plus, X, XCircle, GitMerge } from 'lucide-react';
import { Button, ConversationHeader, Tabs, TabsList, TabsTrigger, TabsContent } from '@easydev/ui';
import { FeatureFlagGate } from '@easydev/feature-flags';
import { Can } from '@easydev/permissions';
import { useInboxStore } from '../store/inboxStore';
import {
  useAddConversationTag,
  useCloseConversation,
  useConversationTags,
  useRemoveConversationTag,
  useResolveConversation,
  useConversationNotes,
  useAddConversationNote,
  useMergeConversations,
} from '../hooks/useQueries';
import { toConversationSummary } from '../lib/ui-adapters';
import type { Conversation } from '../types';
import { ConversationTimeline } from './conversation-timeline';
import { MessageComposer } from './message-composer';
import { CustomerPanel } from './customer-panel';
import { TicketPanel } from './ticket-panel';
import { AiPanel } from './ai-panel';

function NotesPanel({ conversationId }: { conversationId: string }) {
  const { data: notes = [], isLoading } = useConversationNotes(conversationId);
  const addNote = useAddConversationNote();
  const [draft, setDraft] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    addNote.mutate(
      { conversationId, content: draft.trim() },
      { onSuccess: () => setDraft('') },
    );
  };

  return (
    <div className="p-4 space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add an internal note visible only to agents..."
          rows={3}
          className="w-full resize-none rounded border border-neutral-200 p-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={!draft.trim() || addNote.isPending}
          className="w-full rounded bg-neutral-800 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-900 disabled:opacity-50"
        >
          {addNote.isPending ? 'Posting...' : 'Post Note'}
        </button>
      </form>

      {isLoading ? (
        <p className="text-xs text-neutral-400 animate-pulse">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="py-4 text-center text-xs text-neutral-400 italic">No notes yet.</p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} className="rounded border border-neutral-100 bg-amber-50/50 p-2.5 text-xs">
              <p className="font-medium text-neutral-800 leading-relaxed">{note.content}</p>
              <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-neutral-400">
                <span>{note.authorName}</span>
                <span>{new Date(note.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

function MergeConversationDialog({
  conversationId,
  onClose,
}: {
  conversationId: string;
  onClose: () => void;
}) {
  const conversations = useInboxStore((state) => state.conversations);
  const mergeMutation = useMergeConversations();
  const [search, setSearch] = useState('');
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const candidates = conversations.filter(
    (c) =>
      c.id !== conversationId &&
      (search === '' ||
        (c.subject ?? '').toLowerCase().includes(search.toLowerCase()) ||
        c.id.includes(search)),
  );

  const handleMerge = () => {
    if (!primaryId) return;
    setError(null);
    mergeMutation.mutate(
      { primaryId, duplicateId: conversationId },
      {
        onSuccess: () => onClose(),
        onError: () => setError('Merge failed. Please try again.'),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-neutral-500" />
            Merge Conversation
          </h3>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-neutral-100 text-neutral-400">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[11px] text-neutral-500">
          The current conversation will be merged into the selected primary. All messages are moved; the duplicate is closed.
        </p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by subject or ID…"
          className="w-full text-xs rounded border border-neutral-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="max-h-48 overflow-y-auto border border-neutral-100 rounded-md divide-y divide-neutral-50">
          {candidates.length === 0 && (
            <p className="text-[10px] italic text-neutral-400 px-3 py-3 text-center">No other conversations found.</p>
          )}
          {candidates.map((c) => (
            <label key={c.id} className={`flex items-start gap-2 px-3 py-2 cursor-pointer hover:bg-neutral-50 ${primaryId === c.id ? 'bg-primary-50' : ''}`}>
              <input
                type="radio"
                name="merge-primary"
                value={c.id}
                checked={primaryId === c.id}
                onChange={() => setPrimaryId(c.id)}
                className="mt-0.5 accent-primary-600"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-800 truncate">{c.subject || '(No subject)'}</p>
                <p className="text-[10px] text-neutral-400 truncate">{c.id}</p>
              </div>
            </label>
          ))}
        </div>
        {error && <p className="text-[10px] text-danger">{error}</p>}
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1.5">Cancel</button>
          <button
            type="button"
            onClick={handleMerge}
            disabled={!primaryId || mergeMutation.isPending}
            className="flex items-center gap-1.5 text-xs font-bold bg-danger text-white rounded px-3 py-1.5 hover:bg-danger/90 disabled:opacity-50 transition"
          >
            <GitMerge className="h-3.5 w-3.5" />
            {mergeMutation.isPending ? 'Merging…' : 'Merge into primary'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConversationActions({
  conversationId,
  status,
}: {
  conversationId: string;
  status: Conversation['status'];
}) {
  const resolveConversation = useResolveConversation();
  const closeConversation = useCloseConversation();
  const [showMerge, setShowMerge] = useState(false);

  // The local status model collapses backend RESOLVED/CLOSED/ARCHIVED into a
  // single 'resolved' bucket - once we're there, both actions are redundant.
  if (status === 'resolved') return null;

  return (
    <Can resource="conversation" action="resolve">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="xs"
          leadingIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
          isLoading={resolveConversation.isPending}
          onClick={() => resolveConversation.mutate({ conversationId })}
        >
          Resolve
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          leadingIcon={<XCircle className="h-3.5 w-3.5" />}
          isLoading={closeConversation.isPending}
          onClick={() => closeConversation.mutate({ conversationId })}
        >
          Close
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          leadingIcon={<GitMerge className="h-3.5 w-3.5" />}
          onClick={() => setShowMerge(true)}
        >
          Merge
        </Button>
        {showMerge && (
          <MergeConversationDialog conversationId={conversationId} onClose={() => setShowMerge(false)} />
        )}
      </div>
    </Can>
  );
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
    <div className="flex h-full min-w-0 flex-col bg-gradient-to-b from-white to-neutral-50/30">
      <ConversationHeader
        conversation={toConversationSummary(activeConversation)}
        actions={
          <>
            <ConversationActions conversationId={activeConversationId} status={activeConversation.status} />
            <ConversationTags conversationId={activeConversationId} />
            {showOpenLink && (
              <Link
                href={`/conversations/${activeConversationId}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline hover:text-primary-700 transition-colors"
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

        <div className="w-80 shrink-0 border-l border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/20 overflow-y-auto">
          <Tabs defaultValue="customer">
            <TabsList className="m-2">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="ticket">Ticket</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
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
            <TabsContent value="notes">
              <NotesPanel conversationId={activeConversationId} />
            </TabsContent>
            <TabsContent value="knowledge">
              <FeatureFlagGate flag="knowledge_base.enabled" is={true} requiredPermission="read">
                <KnowledgePanel />
              </FeatureFlagGate>
            </TabsContent>
            <TabsContent value="workflow">
              <FeatureFlagGate flag="workflow_orchestration.enabled" is={true} requiredPermission="read">
                <WorkflowPanel />
              </FeatureFlagGate>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
