import React, { useMemo } from 'react';
import { RefreshCw, Workflow } from 'lucide-react';
import { Badge, WorkflowExecutionTimeline, NoWorkflowsEmptyState } from '@easydev/ui';
import { Can } from '@easydev/permissions';
import { useInboxStore } from '../store/inboxStore';
import { useWorkflowExecutions, useRetryWorkflowExecution } from '../hooks/useWorkflowQueries';
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

  const relevant = useMemo(
    () =>
      executions
        .filter((e) => e.conversationId === activeConversationId)
        .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()),
    [executions, activeConversationId],
  );

  if (!activeConversationId) return null;

  if (isLoading) {
    return (
      <div className="p-6 text-center text-neutral-400">
        <span className="text-xs font-semibold animate-pulse">Loading workflow executions...</span>
      </div>
    );
  }

  if (relevant.length === 0) {
    return (
      <div className="p-4">
        <NoWorkflowsEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
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
