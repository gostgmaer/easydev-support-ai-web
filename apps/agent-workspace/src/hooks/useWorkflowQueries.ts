import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@easydev/api-client';
import { WorkflowExecution } from '../types';

export interface WorkflowExecutionFilter {
  workflowId?: string;
  status?: WorkflowExecution['status'];
}

/**
 * The backend's findExecutions only filters by workflowId/status (no conversationId/ticketId
 * param) - callers that need executions for a specific conversation or ticket filter the
 * returned list client-side against execution.conversationId/ticketId.
 */
export function useWorkflowExecutions(filter: WorkflowExecutionFilter = {}) {
  const api = useApiClient();
  return useQuery<WorkflowExecution[]>({
    queryKey: ['workflow-executions', filter],
    queryFn: async () =>
      api.get<WorkflowExecution[]>('/v1/workflows/executions', {
        query: { workflowId: filter.workflowId, status: filter.status },
      }),
  });
}

export function useWorkflowExecution(executionId: string | null) {
  const api = useApiClient();
  return useQuery<WorkflowExecution>({
    queryKey: ['workflow-execution', executionId],
    queryFn: async () => {
      if (!executionId) throw new Error('Execution ID is required');
      return api.get<WorkflowExecution>(`/v1/workflows/executions/${executionId}`);
    },
    enabled: !!executionId,
  });
}

export function useTriggerAiWorkflow() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { workflowId: string; conversationId?: string; ticketId?: string; context?: Record<string, unknown> }) =>
      api.post<{ executionId: string }>('/v1/ai-workflows/trigger', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflow-executions'] }),
  });
}

/**
 * There is no dedicated "retry" endpoint on the backend - the engine only exposes triggering
 * a fresh execution of a template. Retrying a failed execution is implemented as re-running
 * the same workflow template with its original context, which is the closest real equivalent.
 */
export function useRetryWorkflowExecution() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (execution: WorkflowExecution) => {
      return api.post<WorkflowExecution>('/v1/workflows/executions', {
        workflowId: execution.workflowId,
        context: { conversationId: execution.conversationId, ticketId: execution.ticketId },
        triggerSource: 'MANUAL',
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['workflow-executions'] }),
  });
}
