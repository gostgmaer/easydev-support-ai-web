import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useAuthStore, useTenantStore } from '@easydev/stores';
import { useAuth } from '@easydev/auth';

// Backend controllers mount directly at /v1/... with no /api prefix (confirmed
// against main.ts - no setGlobalPrefix call), and every tenant-scoped route
// requires an x-tenant-id header (TenantGuard rejects requests without one).
const adminRequest = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333';
  const token = useAuthStore.getState().tokens?.accessToken;
  const tenantId = useTenantStore.getState().current?.id;
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Admin API Error: ${response.statusText}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
};

// 1. SYSTEM METRICS & DASHBOARD
export function useDashboardMetrics() {
  const setMetrics = useAdminStore((state) => state.setMetrics);
  return useQuery<SystemMetric>({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => {
      const data = await adminRequest<SystemMetric>('/admin/metrics');
      setMetrics(data);
      return data;
    },
    refetchInterval: 10000, // Refetch metrics every 10 seconds for real-time monitoring
  });
}

// 2. CONNECTORS
export function useConnectorsList() {
  const setConnectors = useAdminStore((state) => state.setConnectors);
  return useQuery<Connector[]>({
    queryKey: ['admin', 'connectors'],
    queryFn: async () => {
      const data = await adminRequest<Connector[]>('/admin/connectors');
      setConnectors(data);
      return data;
    },
  });
}

export function useUpdateConnector() {
  const queryClient = useQueryClient();
  const updateStatus = useAdminStore((state) => state.updateConnectorStatus);

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Connector['status'] }) => {
      return adminRequest<Connector>(`/admin/connectors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
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
  const setWorkflows = useAdminStore((state) => state.setWorkflows);
  return useQuery<WorkflowRule[]>({
    queryKey: ['admin', 'workflows'],
    queryFn: async () => {
      const data = await adminRequest<WorkflowRule[]>('/admin/workflows');
      setWorkflows(data);
      return data;
    },
  });
}

export function useToggleWorkflow() {
  const queryClient = useQueryClient();
  const toggle = useAdminStore((state) => state.toggleWorkflowStatus);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return adminRequest<WorkflowRule>(`/admin/workflows/${id}/toggle`, {
        method: 'POST',
      });
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
  const setDocuments = useAdminStore((state) => state.setDocuments);
  return useQuery<KnowledgeDocument[]>({
    queryKey: ['admin', 'documents'],
    queryFn: async () => {
      const data = await adminRequest<KnowledgeDocument[]>('/admin/knowledge/documents');
      setDocuments(data);
      return data;
    },
  });
}

export function useImportKnowledge() {
  const queryClient = useQueryClient();
  const addDoc = useAdminStore((state) => state.addDocument);

  return useMutation({
    mutationFn: async (variables: { title: string; sourceType: KnowledgeDocument['sourceType']; fileUrl?: string; webUrl?: string }) => {
      return adminRequest<KnowledgeDocument>('/admin/knowledge/import', {
        method: 'POST',
        body: JSON.stringify(variables),
      });
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
  const setIncidents = useAdminStore((state) => state.setIncidents);
  return useQuery<IncidentAlert[]>({
    queryKey: ['admin', 'incidents'],
    queryFn: async () => {
      const data = await adminRequest<IncidentAlert[]>('/admin/incidents');
      setIncidents(data);
      return data;
    },
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();
  const resolve = useAdminStore((state) => state.resolveIncident);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return adminRequest<IncidentAlert>(`/admin/incidents/${id}/resolve`, {
        method: 'POST',
      });
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
  const setTeams = useAdminStore((state) => state.setTeams);
  return useQuery<Team[]>({
    queryKey: ['admin', 'teams'],
    queryFn: async () => {
      const result = await adminRequest<{ data: Team[]; total: number }>('/v1/teams');
      setTeams(result.data);
      return result.data;
    },
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const addTeam = useAdminStore((state) => state.addTeam);

  return useMutation({
    mutationFn: async (variables: { name: string; description?: string; department?: string }) => {
      return adminRequest<Team>('/v1/teams', {
        method: 'POST',
        body: JSON.stringify(variables),
      });
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await adminRequest<void>(`/v1/teams/${id}`, { method: 'DELETE' });
      return id;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });
}

// 7. API KEYS
export function useApiKeys() {
  const setApiKeys = useAdminStore((state) => state.setApiKeys);
  return useQuery<ApiKey[]>({
    queryKey: ['admin', 'api-keys'],
    queryFn: async () => {
      const result = await adminRequest<{ data: ApiKey[]; total: number }>('/v1/admin/api-keys');
      setApiKeys(result.data);
      return result.data;
    },
  });
}

// The raw key is only ever returned once, at creation time - it's deliberately
// kept out of the ApiKey type/store (which only ever holds keyPrefix) and
// returned to the caller so the UI can show a one-time "copy now" reveal.
export function useCreateApiKey() {
  const queryClient = useQueryClient();
  const addApiKey = useAdminStore((state) => state.addApiKey);

  return useMutation({
    mutationFn: async (variables: { name: string; scopes: string[]; expiresAt?: string }) => {
      return adminRequest<ApiKey & { rawKey: string }>('/v1/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify(variables),
      });
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
  const queryClient = useQueryClient();
  const removeApiKey = useAdminStore((state) => state.removeApiKey);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return adminRequest<ApiKey>(`/v1/admin/api-keys/${id}`, { method: 'DELETE' });
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
  return useQuery<DashboardMetrics>({
    queryKey: ['admin', 'analytics', 'dashboard', timeRange],
    queryFn: () => adminRequest<DashboardMetrics>(`/v1/analytics/dashboard?timeRange=${encodeURIComponent(timeRange)}`),
  });
}

export function useAnalyticsAiMetrics(timeRange: string) {
  return useQuery<AiDashboardMetrics>({
    queryKey: ['admin', 'analytics', 'ai', timeRange],
    queryFn: () => adminRequest<AiDashboardMetrics>(`/v1/analytics/dashboard/ai?timeRange=${encodeURIComponent(timeRange)}`),
  });
}

// Backend returns raw per-bucket rows for the whole range, not pre-aggregated
// by channel - sum/average them client-side into one row per channel type.
export function useAnalyticsChannelMetrics(timeRange: string) {
  return useQuery<ChannelMetricRow[]>({
    queryKey: ['admin', 'analytics', 'channels', timeRange],
    queryFn: async () => {
      const rows = await adminRequest<any[]>(`/v1/analytics/dashboard/channels?timeRange=${encodeURIComponent(timeRange)}`);
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
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (variables: { timeRange: string; format: 'CSV' | 'PDF' }) => {
      const report = await adminRequest<{ id: string }>('/v1/analytics/reports', {
        method: 'POST',
        body: JSON.stringify({
          name: `Analytics export - ${variables.timeRange}`,
          reportType: 'Overview',
          timeRange: variables.timeRange,
        }),
      });
      return adminRequest<{ success: boolean; message: string }>('/v1/analytics/exports/manual', {
        method: 'POST',
        body: JSON.stringify({
          reportId: report.id,
          format: variables.format,
          recipients: user?.email ? [user.email] : [],
        }),
      });
    },
  });
}
