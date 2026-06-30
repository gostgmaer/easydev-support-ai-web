import React, { useMemo, useState } from 'react';
import { RefreshCw, Workflow, Play, ChevronDown } from 'lucide-react';
import { Badge, WorkflowExecutionTimeline, NoWorkflowsEmptyState } from '@easydev/ui';
import { Can } from '@easydev/permissions';
import { useInboxStore } from '../store/inboxStore';
import { useWorkflowExecutions, useRetryWorkflowExecution, useTriggerAiWorkflow } from '../hooks/useWorkflowQueries';
import { toWorkflowExecutionStep } from '../lib/ui-adapters';

const STATUS_TONE: Record<string, 'neutral' | 'info' | 'success' | 'danger'> = {
  pending: 'neutral',
  running: 'info',
  completed: 'success',
  failed: 'danger',
};

export function WorkflowPanel() {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const { data: executions = [], isLoading } = useWorkflowExecutions();
  const retryMutation = useRetryWorkflowExecution();
  const triggerMutation = useTriggerAiWorkflow();
  const [showTriggerForm, setShowTriggerForm] = useState(false);
  const [workflowId, setWorkflowId] = useState('');
  const [triggerError, setTriggerError] = useState<string | null>(null);

  const relevant = useMemo(
    () =>
      executions
        .filter((e) => e.conversationId === activeConversationId)
        .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()),
    [executions, activeConversationId],
  );

  if (!activeConversationId) return null;

  const handleTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowId.trim()) return;
    setTriggerError(null);
    triggerMutation.mutate(
      { workflowId: workflowId.trim(), conversationId: activeConversationId },
      {
        onSuccess: () => {
          setShowTriggerForm(false);
          setWorkflowId('');
        },
        onError: () => setTriggerError('Failed to trigger workflow. Check the workflow ID and try again.'),
      },
    );
  };

  return (
    <div className="space-y-4 p-4">
      {/* Manual trigger */}
      <Can resource="workflow" action="manage">
        <div className="border border-neutral-200 rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => { setShowTriggerForm((v) => !v); setTriggerError(null); }}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition bg-neutral-50/50"
          >
            <span className="flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5 text-primary-500" />
              Trigger AI Workflow
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${showTriggerForm ? 'rotate-180' : ''}`} />
          </button>
          {showTriggerForm && (
            <form onSubmit={handleTrigger} className="p-3 space-y-2 border-t border-neutral-100">
              <input
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                placeholder="Workflow ID"
                required
                className="w-full text-xs border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {triggerError && <p className="text-[10px] text-danger">{triggerError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!workflowId.trim() || triggerMutation.isPending}
                  className="flex items-center gap-1 text-[10px] font-bold bg-primary-600 text-white rounded px-2.5 py-1 hover:bg-primary-700 disabled:opacity-50 transition"
                >
                  <Play className="h-3 w-3" />
                  {triggerMutation.isPending ? 'Triggering…' : 'Run'}
                </button>
                <button type="button" onClick={() => setShowTriggerForm(false)} className="text-[10px] text-neutral-500 hover:text-neutral-700">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </Can>

      {isLoading && (
        <div className="p-6 text-center text-neutral-400">
          <span className="text-xs font-semibold animate-pulse">Loading workflow executions...</span>
        </div>
      )}

      {!isLoading && relevant.length === 0 && (
        <div className="pt-2">
          <NoWorkflowsEmptyState />
        </div>
      )}

      {relevant.map((execution) => (
        <div key={execution.id} className="space-y-3 rounded-md border border-neutral-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
              <Workflow className="h-4 w-4 text-neutral-400" />
              {execution.workflowName}
            </div>
            <Badge tone={STATUS_TONE[execution.status]}>{execution.status}</Badge>
          </div>

          <WorkflowExecutionTimeline steps={execution.steps.map(toWorkflowExecutionStep)} />

          {execution.status === 'failed' && (
            <Can resource="workflow" action="manage">
              <button
                type="button"
                onClick={() => retryMutation.mutate(execution)}
                disabled={retryMutation.isPending}
                className="flex w-full items-center justify-center gap-1.5 rounded border border-primary-200 bg-primary-50 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry workflow
              </button>
            </Can>
          )}
        </div>
      ))}
    </div>
  );
}
