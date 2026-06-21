import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@easydev/api-client';
import {
  useAdminStore,
  Connector,
  KnowledgeDocument,
  WorkflowRule,
  IncidentAlert,
  SystemMetric,
  Team,
  ApiKey,
} from '../store/adminStore';
import { useAuth } from '@easydev/auth';

// 1. SYSTEM METRICS & DASHBOARD
export function useDashboardMetrics() {
  const apiClient = useApiClient();
  const setMetrics = useAdminStore((state) => state.setMetrics);
  return useQuery<SystemMetric>({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => {
      const data = await apiClient.get<SystemMetric>('/admin/metrics');
      setMetrics(data);
      return data;
    },
    refetchInterval: 10000, // Refetch metrics every 10 seconds for real-time monitoring
  });
}

// 2. CONNECTORS
export function useConnectorsList() {
  const apiClient = useApiClient();
  const setConnectors = useAdminStore((state) => state.setConnectors);
  return useQuery<Connector[]>({
    queryKey: ['admin', 'connectors'],
    queryFn: async () => {
      const data = await apiClient.get<Connector[]>('/admin/connectors');
      setConnectors(data);
      return data;
    },
  });
}

export function useUpdateConnector() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const updateStatus = useAdminStore((state) => state.updateConnectorStatus);

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Connector['status'] }) => {
      return apiClient.patch<Connector>(`/admin/connectors/${id}`, { status });
    },
    onMutate: async ({ id, status }) => {
      // Optimistic update
      updateStatus(id, status);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'connectors'] });
    },
  });
}

// 3. WORKFLOWS
export function useWorkflowsList() {
  const apiClient = useApiClient();
  const setWorkflows = useAdminStore((state) => state.setWorkflows);
  return useQuery<WorkflowRule[]>({
    queryKey: ['admin', 'workflows'],
    queryFn: async () => {
      const data = await apiClient.get<WorkflowRule[]>('/admin/workflows');
      setWorkflows(data);
      return data;
    },
  });
}

export function useToggleWorkflow() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const toggle = useAdminStore((state) => state.toggleWorkflowStatus);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return apiClient.post<WorkflowRule>(`/admin/workflows/${id}/toggle`);
    },
    onMutate: async ({ id }) => {
      toggle(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'workflows'] });
    },
  });
}

// 4. KNOWLEDGE BASE
export function useKnowledgeDocuments() {
  const apiClient = useApiClient();
  const setDocuments = useAdminStore((state) => state.setDocuments);
  return useQuery<KnowledgeDocument[]>({
    queryKey: ['admin', 'documents'],
    queryFn: async () => {
      const data = await apiClient.get<KnowledgeDocument[]>('/admin/knowledge/documents');
      setDocuments(data);
      return data;
    },
  });
}

export function useImportKnowledge() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const addDoc = useAdminStore((state) => state.addDocument);

  return useMutation({
    mutationFn: async (variables: { title: string; sourceType: KnowledgeDocument['sourceType']; fileUrl?: string; webUrl?: string }) => {
      return apiClient.post<KnowledgeDocument>('/admin/knowledge/import', variables);
    },
    onSuccess: (data) => {
      addDoc(data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
    },
  });
}

// 5. INCIDENTS & HEALTH
export function useIncidentsAlerts() {
  const apiClient = useApiClient();
  const setIncidents = useAdminStore((state) => state.setIncidents);
  return useQuery<IncidentAlert[]>({
    queryKey: ['admin', 'incidents'],
    queryFn: async () => {
      const data = await apiClient.get<IncidentAlert[]>('/admin/incidents');
      setIncidents(data);
      return data;
    },
  });
}

export function useResolveIncident() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const resolve = useAdminStore((state) => state.resolveIncident);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return apiClient.post<IncidentAlert>(`/admin/incidents/${id}/resolve`);
    },
    onMutate: async ({ id }) => {
      resolve(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'incidents'] });
    },
  });
}

// 6. TEAMS
export function useTeams() {
  const apiClient = useApiClient();
  const setTeams = useAdminStore((state) => state.setTeams);
  return useQuery<Team[]>({
    queryKey: ['admin', 'teams'],
    queryFn: async () => {
      const result = await apiClient.get<{ data: Team[]; total: number }>('/v1/teams');
      setTeams(result.data);
      return result.data;
    },
  });
}

export function useCreateTeam() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const addTeam = useAdminStore((state) => state.addTeam);

  return useMutation({
    mutationFn: async (variables: { name: string; description?: string; department?: string }) => {
      return apiClient.post<Team>('/v1/teams', variables);
    },
    onSuccess: (data) => {
      addTeam(data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });
}

// Archiving is one-way in the domain (Team.archive() soft-deletes), unlike the
// reversible active/inactive toggle this page used to fake.
export function useArchiveTeam() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await apiClient.delete<void>(`/v1/teams/${id}`);
      return id;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });
}

// 7. API KEYS
export function useApiKeys() {
  const apiClient = useApiClient();
  const setApiKeys = useAdminStore((state) => state.setApiKeys);
  return useQuery<ApiKey[]>({
    queryKey: ['admin', 'api-keys'],
    queryFn: async () => {
      const result = await apiClient.get<{ data: ApiKey[]; total: number }>('/v1/admin/api-keys');
      setApiKeys(result.data);
      return result.data;
    },
  });
}

// The raw key is only ever returned once, at creation time - it's deliberately
// kept out of the ApiKey type/store (which only ever holds keyPrefix) and
// returned to the caller so the UI can show a one-time "copy now" reveal.
export function useCreateApiKey() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const addApiKey = useAdminStore((state) => state.addApiKey);

  return useMutation({
    mutationFn: async (variables: { name: string; scopes: string[]; expiresAt?: string }) => {
      return apiClient.post<ApiKey & { rawKey: string }>('/v1/admin/api-keys', variables);
    },
    onSuccess: (data) => {
      const { rawKey, ...apiKey } = data;
      addApiKey(apiKey);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] });
    },
  });
}

export function useRevokeApiKey() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const removeApiKey = useAdminStore((state) => state.removeApiKey);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return apiClient.delete<ApiKey>(`/v1/admin/api-keys/${id}`);
    },
    onMutate: async ({ id }) => {
      removeApiKey(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] });
    },
  });
}

// 8. ANALYTICS
export interface DashboardMetrics {
  conversationsCount: number;
  messagesCount: number;
  ticketsCount: number;
  resolvedTicketsCount: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  csatScore: number;
  slaViolationRate: number;
  estimatedCostSavings: number;
}

export interface AiDashboardMetrics {
  aiRequests: number;
  tokensUsed: number;
  estimatedCost: number;
  escalationRate: number;
  aiResolutionRate: number;
  humanResolutionRate: number;
}

export interface ChannelMetricRow {
  channelType: string;
  messageCount: number;
  conversationCount: number;
  deliverySuccessRate: number;
}

export function useAnalyticsDashboard(timeRange: string) {
  const apiClient = useApiClient();
  return useQuery<DashboardMetrics>({
    queryKey: ['admin', 'analytics', 'dashboard', timeRange],
    queryFn: () => apiClient.get<DashboardMetrics>('/v1/analytics/dashboard', { query: { timeRange } }),
  });
}

export function useAnalyticsAiMetrics(timeRange: string) {
  const apiClient = useApiClient();
  return useQuery<AiDashboardMetrics>({
    queryKey: ['admin', 'analytics', 'ai', timeRange],
    queryFn: () => apiClient.get<AiDashboardMetrics>('/v1/analytics/dashboard/ai', { query: { timeRange } }),
  });
}

// Backend returns raw per-bucket rows for the whole range, not pre-aggregated
// by channel - sum/average them client-side into one row per channel type.
export function useAnalyticsChannelMetrics(timeRange: string) {
  const apiClient = useApiClient();
  return useQuery<ChannelMetricRow[]>({
    queryKey: ['admin', 'analytics', 'channels', timeRange],
    queryFn: async () => {
      const rows = await apiClient.get<any[]>('/v1/analytics/dashboard/channels', { query: { timeRange } });
      const byChannel = new Map<string, ChannelMetricRow>();
      for (const row of rows) {
        const existing = byChannel.get(row.channelType) ?? {
          channelType: row.channelType,
          messageCount: 0,
          conversationCount: 0,
          deliverySuccessRate: 0,
        };
        existing.messageCount += row.messageCount ?? 0;
        existing.conversationCount += row.conversationCount ?? 0;
        existing.deliverySuccessRate = Number(row.deliverySuccessRate ?? existing.deliverySuccessRate);
        byChannel.set(row.channelType, existing);
      }
      return Array.from(byChannel.values());
    },
  });
}

// "Export" has no synchronous download endpoint (the backend's download route
// only serves previously-generated files) - this creates a report definition
// for the current view, then queues an async email delivery to the requesting
// admin, which is the one real, working path the backend supports today.
export function useTriggerAnalyticsExport() {
  const apiClient = useApiClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (variables: { timeRange: string; format: 'CSV' | 'PDF' }) => {
      const report = await apiClient.post<{ id: string }>('/v1/analytics/reports', {
        name: `Analytics export - ${variables.timeRange}`,
        reportType: 'Overview',
        timeRange: variables.timeRange,
      });
      return apiClient.post<{ success: boolean; message: string }>('/v1/analytics/exports/manual', {
        reportId: report.id,
        format: variables.format,
        recipients: user?.email ? [user.email] : [],
      });
    },
  });
}
