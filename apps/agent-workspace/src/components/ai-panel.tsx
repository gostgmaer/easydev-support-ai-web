import React, { useState } from 'react';
import { Bot, Pause, Play } from 'lucide-react';
import {
  AiStatusIndicator,
  AiResponseCard,
  AiToolCallViewer,
  AiEscalationBanner,
  AiApprovalPanel,
  Badge,
} from '@easydev/ui';
import { Can } from '@easydev/permissions';
import { useConversationStore } from '../store/conversationStore';
import { useInboxStore } from '../store/inboxStore';
import { useAiStore } from '../store/aiStore';
import {
  useAiSession,
  useUpdateAiStatus,
  useAiEscalations,
  useResolveEscalation,
  useGenerateAiDraft,
} from '../hooks/useAiQueries';
import { toAiApprovalRequest, toAiToolCall } from '../lib/ui-adapters';

export function AiPanel() {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const conversations = useInboxStore((state) => state.conversations);
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const aiDraft = useAiStore((state) => (activeConversationId ? state.drafts[activeConversationId] : null));
  const setDraft = useConversationStore((state) => state.setDraft);

  const { data: session } = useAiSession(activeConversationId);
  const updateAiStatusMutation = useUpdateAiStatus();
  const { data: escalations = [] } = useAiEscalations('pending');
  const resolveEscalationMutation = useResolveEscalation();
  const generateDraftMutation = useGenerateAiDraft();

  const [editingContent, setEditingContent] = useState<string | null>(null);

  if (!activeConv) return null;

  const conversationEscalation = escalations.find((e) => e.conversationId === activeConv.id);

  const handleStatusChange = (status: 'active' | 'paused' | 'takeover') => {
    updateAiStatusMutation.mutate({ conversationId: activeConv.id, status });
  };

  const handleApplyDraft = (content: string) => setDraft(activeConv.id, content);

  const handleEdit = (content: string) => setEditingContent(content);

  const handleUseEditedDraft = () => {
    if (editingContent !== null) {
      setDraft(activeConv.id, editingContent);
      setEditingContent(null);
    }
  };

  // No dedicated "escalate" endpoint exists - escalating manually means the agent takes
  // over the conversation from the AI, which is the real, available action.
  const handleEscalate = () => handleStatusChange('takeover');

  // The backend only exposes resolving an escalation (no separate approve/reject) - both
  // decisions map to the same resolve call, which is the closest real equivalent.
  const handleEscalationDecision = () => {
    if (conversationEscalation) resolveEscalationMutation.mutate(conversationEscalation.id);
  };

  return (
    <div className="flex h-full flex-col divide-y divide-neutral-100 overflow-y-auto bg-white" aria-label="AI Assistant Panel">
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <AiStatusIndicator status={session?.status ?? 'idle'} />
          <Can resource="ai_agent" action="manage">
            {activeConv.aiStatus === 'active' ? (
              <button
                onClick={() => handleStatusChange('paused')}
                className="flex items-center gap-1.5 rounded border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning hover:bg-warning/20"
                aria-label="Pause AI copilot agent"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('active')}
                className="flex items-center gap-1.5 rounded border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/20"
                aria-label="Resume AI copilot agent"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Resume</span>
              </button>
            )}
          </Can>
        </div>

        <Can resource="ai_agent" action="manage">
          {activeConv.aiStatus !== 'takeover' ? (
            <button
              onClick={() => handleStatusChange('takeover')}
              className="flex w-full items-center justify-center gap-1.5 rounded border border-primary-200 bg-primary-50 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Manual Takeover</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex w-full items-center justify-center gap-1.5 rounded border border-neutral-300 bg-neutral-100 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Hand Back to AI</span>
            </button>
          )}
        </Can>
      </div>

      {conversationEscalation && (
        <div className="p-4">
          <AiEscalationBanner reason={conversationEscalation.reason} onAcknowledge={handleEscalationDecision} />
          <div className="mt-2">
            <AiApprovalPanel
              request={toAiApprovalRequest(conversationEscalation)}
              onDecision={handleEscalationDecision}
              isSubmitting={resolveEscalationMutation.isPending}
            />
          </div>
        </div>
      )}

      <div className="p-4">
        {editingContent !== null ? (
          <div className="space-y-2">
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              className="min-h-[120px] w-full resize-none rounded border border-neutral-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <button onClick={handleUseEditedDraft} className="flex-1 rounded bg-primary-500 py-1.5 text-xs font-semibold text-white hover:bg-primary-600">
                Use this version
              </button>
              <button onClick={() => setEditingContent(null)} className="rounded border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
                Cancel
              </button>
            </div>
          </div>
        ) : aiDraft ? (
          <AiResponseCard
            responseContent={aiDraft.content}
            confidence={aiDraft.confidence}
            executionCost={aiDraft.cost}
            onApplyDraft={handleApplyDraft}
            onEdit={handleEdit}
            onEscalate={handleEscalate}
          />
        ) : (
          <div className="py-6 text-center text-xs text-neutral-400">
            <Bot className="mx-auto mb-2 h-8 w-8 animate-bounce text-neutral-300" />
            <p>No draft suggestion available yet.</p>
            <Can resource="ai_agent" action="manage">
              <button
                onClick={() => generateDraftMutation.mutate(activeConv.id)}
                disabled={generateDraftMutation.isPending}
                className="mt-3 rounded border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generateDraftMutation.isPending ? 'Generating…' : 'Generate Suggestion'}
              </button>
            </Can>
          </div>
        )}
      </div>

      {aiDraft && aiDraft.toolCalls.length > 0 && (
        <div className="space-y-2 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">LLM Tool Executions</h3>
          <div className="space-y-2">
            {aiDraft.toolCalls.map((tool, idx) => (
              <AiToolCallViewer key={idx} toolCall={toAiToolCall(tool, idx)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
