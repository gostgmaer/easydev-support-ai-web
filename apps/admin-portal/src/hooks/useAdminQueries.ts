import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@easydev/api-client';
import {
  useAdminStore,
  Connector,
  KnowledgeDocument,
  KnowledgeCategory,
  KnowledgeSource,
  WorkflowRule,
  IncidentAlert,
  Team,
  ApiKey,
  Webhook,
  CommunicationChannel,
} from '../store/adminStore';
import { useAuth } from '@easydev/auth';

// 1. DASHBOARD METRICS
// There is no simple "platform KPI summary" endpoint - /v1/admin/dashboards is
// a configurable-dashboard-builder API (widgets/layouts), a different feature.
// The real KPI source is the same analytics endpoints the Analytics page uses.
export function useActiveAgentsCount() {
  const apiClient = useApiClient();
  return useQuery<number>({
    queryKey: ['admin', 'agents', 'active-count'],
    queryFn: async () => {
      const result = await apiClient.get<{ total: number }>('/v1/agents', {
        query: { status: 'ACTIVE', limit: 1 },
      });
      return result.total;
    },
  });
}

export interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export function useQueueStats() {
  const apiClient = useApiClient();
  return useQuery<QueueStats[]>({
    queryKey: ['admin', 'health', 'queues'],
    queryFn: () => apiClient.get<QueueStats[]>('/v1/admin/health/queues'),
    refetchInterval: 15000,
  });
}

export interface SystemHealthCheck {
  id: string;
  serviceName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | string;
  latencyMs: number;
  errorRate: number;
  lastCheckAt: string;
}

export function useSystemHealthChecks() {
  const apiClient = useApiClient();
  return useQuery<SystemHealthCheck[]>({
    queryKey: ['admin', 'health', 'services'],
    queryFn: () => apiClient.get<SystemHealthCheck[]>('/v1/admin/health'),
    refetchInterval: 15000,
  });
}

export function useRunHealthSweep() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<SystemHealthCheck[]>('/v1/admin/health/sweep'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'health', 'services'] });
    },
  });
}

export function useWorkflowMonitoring() {
  const apiClient = useApiClient();
  return useQuery<Record<string, number>>({
    queryKey: ['admin', 'health', 'workflows'],
    queryFn: () => apiClient.get<Record<string, number>>('/v1/admin/health/workflows'),
  });
}

// 2. CONNECTORS
export function useConnectorsList() {
  const apiClient = useApiClient();
  const setConnectors = useAdminStore((state) => state.setConnectors);
  return useQuery<Connector[]>({
    queryKey: ['admin', 'connectors'],
    queryFn: async () => {
      const result = await apiClient.get<{ data: Connector[]; total: number }>('/v1/connectors');
      setConnectors(result.data);
      return result.data;
    },
  });
}

// The real backend models connector lifecycle as discrete actions
// (activate/pause/disable), not an arbitrary PATCH {status}.
export function useSetConnectorStatus() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const updateStatus = useAdminStore((state) => state.updateConnectorStatus);

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'activate' | 'pause' | 'disable' }) => {
      return apiClient.post<Connector>(`/v1/connectors/${id}/${action}`);
    },
    onMutate: async ({ id, action }) => {
      const status = action === 'activate' ? 'ACTIVE' : action === 'pause' ? 'PAUSED' : 'DISABLED';
      updateStatus(id, status);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'connectors'] });
    },
  });
}

export interface InstallConnectorPayload {
  name: string;
  slug: string;
  connectorType: string;
  authType: string;
  description?: string;
  baseUrl?: string;
}

export function useInstallConnector() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: InstallConnectorPayload) => {
      return apiClient.post<Connector>('/v1/connectors/install', payload);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'connectors'] });
    },
  });
}

export function useConfigureConnectorApiKey() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, apiKey, headerName }: { id: string; apiKey: string; headerName: string }) => {
      return apiClient.post<{ status: string; credentialId: string }>(`/v1/connectors/${id}/apikey`, {
        apiKey,
        headerName,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'connectors'] });
    },
  });
}

export function useConfigureConnectorOAuth() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...dto
    }: {
      id: string;
      clientId: string;
      clientSecret: string;
      tokenUrl: string;
      authUrl?: string;
      scopes?: string[];
    }) => {
      return apiClient.post<{ status: string; credentialId: string }>(`/v1/connectors/${id}/oauth`, dto);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'connectors'] });
    },
  });
}

export interface ConnectorExecution {
  id: string;
  connectorId: string;
  capabilityType: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'RETRYING' | 'CIRCUIT_OPEN';
  statusCode?: number;
  error?: string;
  attempt: number;
  latencyMs: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export function useConnectorExecutions(connectorId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<ConnectorExecution[]>({
    queryKey: ['admin', 'connectors', connectorId, 'executions'],
    queryFn: async () => {
      const result = await apiClient.get<{ data: ConnectorExecution[]; total: number }>(
        `/v1/connectors/${connectorId}/executions`,
      );
      return result.data;
    },
    enabled: !!connectorId,
  });
}

export function useRetryConnectorExecution() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ connectorId, executionId }: { connectorId: string; executionId: string }) => {
      return apiClient.post<{ success: boolean; result: unknown }>(
        `/v1/connectors/executions/${executionId}/retry`,
      );
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'connectors', variables.connectorId, 'executions'],
      });
    },
  });
}

// 3. WORKFLOWS
// "Workflows" in the admin UI maps to the real WorkflowTemplate aggregate
// (v1/workflows/templates) - there's no separate "workflows" list endpoint;
// templates are the activatable/pausable workflow definitions themselves.
export function useWorkflowsList() {
  const apiClient = useApiClient();
  const setWorkflows = useAdminStore((state) => state.setWorkflows);
  return useQuery<WorkflowRule[]>({
    queryKey: ['admin', 'workflows'],
    queryFn: async () => {
      const data = await apiClient.get<WorkflowRule[]>('/v1/workflows/templates');
      setWorkflows(data);
      return data;
    },
  });
}

export function useWorkflowExecutions(workflowId?: string) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['admin', 'workflow-executions', workflowId],
    queryFn: () =>
      apiClient.get<Record<string, unknown>[]>('/v1/workflows/executions', {
        query: workflowId ? { workflowId } : undefined,
      }),
  });
}

export function useToggleWorkflow() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const toggle = useAdminStore((state) => state.toggleWorkflowStatus);

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: WorkflowRule['status'] }) => {
      const action = status === 'ACTIVE' ? 'pause' : 'activate';
      return apiClient.post<WorkflowRule>(`/v1/workflows/templates/${id}/${action}`);
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
      const result = await apiClient.get<{ data: KnowledgeDocument[]; total: number }>('/v1/knowledge-documents');
      setDocuments(result.data);
      return result.data;
    },
  });
}

export function useKnowledgeSources() {
  const apiClient = useApiClient();
  const setSources = useAdminStore((state) => state.setSources);
  return useQuery<KnowledgeSource[]>({
    queryKey: ['admin', 'knowledge-sources'],
    queryFn: async () => {
      const result = await apiClient.get<{ data: KnowledgeSource[]; total: number }>('/v1/knowledge-sources');
      setSources(result.data);
      return result.data;
    },
  });
}

export function useCreateKnowledgeSource() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const addSource = useAdminStore((state) => state.addSource);

  return useMutation({
    mutationFn: async (variables: { name: string; sourceType: string; uri?: string; description?: string }) => {
      return apiClient.post<KnowledgeSource>('/v1/knowledge-sources', variables);
    },
    onSuccess: (data) => {
      addSource(data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge-sources'] });
    },
  });
}

export function useCreateKnowledgeDocument() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const addDocument = useAdminStore((state) => state.addDocument);

  return useMutation({
    mutationFn: async (variables: {
      sourceId: string;
      categoryId?: string;
      title: string;
      slug: string;
      documentType: string;
      language: string;
      fileUrl?: string;
      tags?: string[];
    }) => {
      return apiClient.post<KnowledgeDocument>('/v1/knowledge-documents', variables);
    },
    onSuccess: (data) => {
      addDocument(data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
    },
  });
}

export function useDeleteKnowledgeDocument() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const removeDoc = useAdminStore((state) => state.removeDocument);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await apiClient.delete<void>(`/v1/knowledge-documents/${id}`);
      return id;
    },
    onMutate: async ({ id }) => {
      removeDoc(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
    },
  });
}

export function useKnowledgeCategories() {
  const apiClient = useApiClient();
  return useQuery<KnowledgeCategory[]>({
    queryKey: ['admin', 'knowledge-categories'],
    queryFn: () => apiClient.get<KnowledgeCategory[]>('/v1/knowledge-categories'),
  });
}

// 4a. CHANNELS
export function useChannelsList() {
  const apiClient = useApiClient();
  return useQuery<CommunicationChannel[]>({
    queryKey: ['admin', 'channels'],
    queryFn: async () => {
      const result = await apiClient.get<{ data: CommunicationChannel[]; total: number }>('/v1/channels');
      return result.data;
    },
  });
}

export function useSetChannelEnabled() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      await apiClient.put<void>(`/v1/channels/${id}/${enabled ? 'enable' : 'disable'}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels'] });
    },
  });
}

// 4a-2. AUDIT LOG
export interface AuditLogRecord {
  id: string;
  userId: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export function useAuditLog() {
  const apiClient = useApiClient();
  return useQuery<{ data: AuditLogRecord[]; total: number }>({
    queryKey: ['admin', 'audit', 'entities'],
    queryFn: () => apiClient.get<{ data: AuditLogRecord[]; total: number }>('/v1/admin/audit/entities', { query: { limit: 50 } }),
  });
}

// 4b. AI SETTINGS
export interface AiSettings {
  defaultAgent?: string;
  confidenceThreshold: number;
  escalationThreshold: number;
  allowedLanguages?: string[];
  defaultLanguage?: string;
  autoResponseEnabled: boolean;
  autoEscalationEnabled: boolean;
  costLimitDaily?: number;
  costLimitMonthly?: number;
  modelConfiguration?: Record<string, any>;
}

export const useAiSettings = settingsQuery<AiSettings>('ai', '/v1/settings/ai');
export function useUpdateAiSettings() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<AiSettings>) => apiClient.put<AiSettings>('/v1/settings/ai', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'ai'] }),
  });
}

export interface ChannelSettings {
  channelType: string;
  enabled: boolean;
  businessHoursOnly: boolean;
  autoAssignmentEnabled: boolean;
  configuration?: Record<string, any>;
}

export const useChannelSettings = settingsQuery<ChannelSettings[]>('channels', '/v1/settings/channels');
export const useUpdateChannelSettings = settingsMutation<ChannelSettings>('channels', '/v1/settings/channels', 'put');

// 5. INCIDENTS & HEALTH
export function useIncidentsAlerts() {
  const apiClient = useApiClient();
  const setIncidents = useAdminStore((state) => state.setIncidents);
  return useQuery<IncidentAlert[]>({
    queryKey: ['admin', 'incidents'],
    queryFn: async () => {
      const result = await apiClient.get<{ data: IncidentAlert[]; total: number }>('/v1/admin/incidents');
      setIncidents(result.data);
      return result.data;
    },
  });
}

export function useResolveIncident() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const resolve = useAdminStore((state) => state.resolveIncident);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return apiClient.post<IncidentAlert>(`/v1/admin/incidents/${id}/resolve`);
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

export interface AgentProfile {
  id: string;
  displayName: string;
  status: string;
  employeeCode?: string;
  timezone: string;
  skillScore: number;
  capacity: {
    capacity: number;
    maxConcurrentConversations: number;
    maxOpenTickets: number;
  };
}

export function useAgentProfiles(search?: string) {
  const apiClient = useApiClient();
  return useQuery<AgentProfile[]>({
    queryKey: ['admin', 'agent-profiles', search],
    queryFn: async () => {
      const result = await apiClient.get<{ data: AgentProfile[]; total: number }>('/v1/agents', {
        query: { limit: 100, ...(search ? { search } : {}) },
      });
      return result.data;
    },
  });
}

export function useCreateAgentProfile() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { userId: string; displayName: string; employeeCode?: string; timezone?: string }) => {
      return apiClient.post<AgentProfile>('/v1/agents', variables);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'agent-profiles'] });
    },
  });
}

export function useUpdateAgentProfile() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AgentProfile> & { maxConcurrentConversations?: number; maxOpenTickets?: number; capacityScore?: number } }) => {
      return apiClient.put<AgentProfile>(`/v1/agents/${id}`, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'agent-profiles'] });
    },
  });
}

export function useDeleteAgentProfile() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete<{ success: boolean }>(`/v1/agents/${id}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'agent-profiles'] });
    },
  });
}

export function useAddTeamAgent() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, agentProfileId, role }: { teamId: string; agentProfileId: string; role: string }) => {
      return apiClient.post<{ success: boolean }>(`/v1/teams/${teamId}/agents`, { agentProfileId, role });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });
}

export function useUpdateTeamAgentRole() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, agentProfileId, role }: { teamId: string; agentProfileId: string; role: string }) => {
      return apiClient.put<{ success: boolean }>(`/v1/teams/${teamId}/agents/${agentProfileId}/role`, { role });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });
}

export function useRemoveTeamAgent() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, agentProfileId }: { teamId: string; agentProfileId: string }) => {
      await apiClient.delete<void>(`/v1/teams/${teamId}/agents/${agentProfileId}`);
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

// The new raw key is only ever returned once, at rotation time - same
// one-time-reveal pattern as useCreateApiKey. The rotated key keeps its
// existing id, so the list refetch on settle is what syncs the store
// (no optimistic local edit needed).
export function useRotateApiKey() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return apiClient.post<ApiKey & { rawKey: string }>(`/v1/admin/api-keys/${id}/rotate`);
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

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  reportType: string;
  timeRange: string;
  createdAt: string;
  updatedAt: string;
}

export function useAnalyticsReports() {
  const apiClient = useApiClient();
  return useQuery<AnalyticsReport[]>({
    queryKey: ['admin', 'analytics', 'reports'],
    queryFn: () => apiClient.get<AnalyticsReport[]>('/v1/analytics/reports'),
  });
}

export function useCreateAnalyticsReport() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { name: string; reportType: string; timeRange: string }) =>
      apiClient.post<AnalyticsReport>('/v1/analytics/reports', variables),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'analytics', 'reports'] }),
  });
}

export function useDeleteAnalyticsReport() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => apiClient.delete<void>(`/v1/analytics/reports/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'analytics', 'reports'] }),
  });
}

// Same "no synchronous download" constraint as useTriggerAnalyticsExport -
// queues an async email delivery of an already-generated report.
export function useExportAnalyticsReport() {
  const apiClient = useApiClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format: 'CSV' | 'PDF' }) =>
      apiClient.post<{ success: boolean; message: string }>('/v1/analytics/exports/manual', {
        reportId,
        format,
        recipients: user?.email ? [user.email] : [],
      }),
  });
}

// 9. TENANT SETTINGS
export interface TenantSettings {
  tenantName?: string;
  timezone?: string;
  locale?: string;
  country?: string;
  currency?: string;
  supportEmail?: string;
  supportPhone?: string;
  websiteUrl?: string;
}

export interface BrandingSettings {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  themeMode?: string;
}

export interface BusinessHoursEntry {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOpen: boolean;
  timezone: string;
}

export interface HolidayEntry {
  id: string;
  holidayName: string;
  holidayDate: string;
  isRecurring: boolean;
  country?: string;
  region?: string;
}

export interface SecuritySettings {
  sessionTimeout?: number;
  ipWhitelist?: string[];
  mfaRequired?: boolean;
  apiKeyRotationDays?: number;
  auditRetentionDays?: number;
}

export interface FeatureFlagEntry {
  id: string;
  featureKey: string;
  enabled: boolean;
  rolloutPercentage: number;
}

export interface UsageLimits {
  maxAgents?: number;
  maxConversations?: number;
  maxMessages?: number;
  maxWorkflows?: number;
  maxConnectors?: number;
  maxDocuments?: number;
  maxStorage?: number;
  maxAiRequests?: number;
}

function settingsQuery<T>(key: string, path: string) {
  return function useSettingsQuery() {
    const apiClient = useApiClient();
    return useQuery<T>({
      queryKey: ['admin', 'settings', key],
      queryFn: () => apiClient.get<T>(path),
    });
  };
}

function settingsMutation<TDto>(key: string, path: string, method: 'put' | 'post' = 'put') {
  return function useSettingsMutation() {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (dto: TDto) => apiClient[method]<unknown>(path, dto),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'settings', key] }),
    });
  };
}

export const useTenantSettings = settingsQuery<TenantSettings>('general', '/v1/settings');
export const useUpdateTenantSettings = settingsMutation<Partial<TenantSettings>>('general', '/v1/settings');

export const useBranding = settingsQuery<BrandingSettings>('branding', '/v1/settings/branding');
export const useUpdateBranding = settingsMutation<Partial<BrandingSettings>>('branding', '/v1/settings/branding');

export const useBusinessHours = settingsQuery<BusinessHoursEntry[]>('business-hours', '/v1/settings/business-hours');
export const useSaveBusinessHours = settingsMutation<Omit<BusinessHoursEntry, 'id'>>('business-hours', '/v1/settings/business-hours', 'post');

export const useHolidays = settingsQuery<HolidayEntry[]>('holidays', '/v1/settings/holidays');
export const useSaveHoliday = settingsMutation<Omit<HolidayEntry, 'id'>>('holidays', '/v1/settings/holidays', 'post');

export function useDeleteHoliday() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/settings/holidays/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'holidays'] }),
  });
}

export const useSecuritySettings = settingsQuery<SecuritySettings>('security', '/v1/settings/security');
export const useUpdateSecuritySettings = settingsMutation<Partial<SecuritySettings>>('security', '/v1/settings/security');

export interface WidgetSettings {
  widgetName?: string;
  widgetColor?: string;
  widgetPosition?: string;
  welcomeMessage?: string;
  offlineMessage?: string;
  avatarUrl?: string;
  customCss?: string;
  customJs?: string;
}

export const useWidgetSettings = settingsQuery<WidgetSettings>('widget', '/v1/settings/widget');
export const useUpdateWidgetSettings = settingsMutation<Partial<WidgetSettings>>('widget', '/v1/settings/widget');

export const useFeatureFlags = settingsQuery<FeatureFlagEntry[]>('feature-flags', '/v1/settings/feature-flags');
export const useSaveFeatureFlag = settingsMutation<{ featureKey: string; enabled: boolean; rolloutPercentage: number }>(
  'feature-flags',
  '/v1/settings/feature-flags',
  'post',
);

export const useUsageLimits = settingsQuery<UsageLimits>('usage-limits', '/v1/settings/usage-limits');
export const useUpdateUsageLimits = settingsMutation<Partial<UsageLimits>>('usage-limits', '/v1/settings/usage-limits');

// 10. TENANT PROVISIONING
// The tenant itself (its id, and the calling admin's JWT for it) is created
// upstream in EasyDev IAM - this only provisions this product's own
// per-tenant resources (settings/branding/feature flags/first API key) for a
// tenant IAM already knows about.
export interface ProvisionTenantResult {
  tenantId: string;
  apiKey: string;
  plan: string;
  provisionedAt: string;
}

export function useProvisionTenant() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: {
      name: string;
      plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
      adminEmail: string;
      adminName: string;
      logoUrl?: string;
      primaryColor?: string;
      timezone?: string;
      locale?: string;
    }) => {
      return apiClient.post<ProvisionTenantResult>('/v1/admin/tenants/provision', variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] });
    },
  });
}

// 12. WIDGET CONFIGURATION
export interface WidgetAdminConfig {
  id: string;
  widgetName: string;
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  position: string;
  allowedDomains: string[];
  identityVerificationSecret?: string;
}

export function useWidgetAdminConfig() {
  const apiClient = useApiClient();
  return useQuery<WidgetAdminConfig>({
    queryKey: ['admin', 'widget-config'],
    queryFn: () => apiClient.get<WidgetAdminConfig>('/v1/widget/config/admin'),
  });
}

export function useRotateWidgetIdentitySecret() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<WidgetAdminConfig>('/v1/widget/config/admin/rotate-identity-secret'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'widget-config'] }),
  });
}

// 11. WEBHOOKS
export function useWebhooks() {
  const apiClient = useApiClient();
  const setWebhooks = useAdminStore((state) => state.setWebhooks);
  return useQuery<Webhook[]>({
    queryKey: ['admin', 'webhooks'],
    queryFn: async () => {
      const result = await apiClient.get<{ data: Webhook[]; total: number }>('/v1/admin/webhooks');
      setWebhooks(result.data);
      return result.data;
    },
  });
}

// The signing secret is only ever returned once, at registration time - same
// one-time-reveal pattern as useCreateApiKey.
export function useRegisterWebhook() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const addWebhook = useAdminStore((state) => state.addWebhook);

  return useMutation({
    mutationFn: async (variables: { name: string; url: string; events: string[] }) => {
      return apiClient.post<Webhook & { secret: string }>('/v1/admin/webhooks', variables);
    },
    onSuccess: (data) => {
      const { secret, ...webhook } = data;
      addWebhook(webhook);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'webhooks'] });
    },
  });
}

export function useSetWebhookEnabled() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const updateWebhook = useAdminStore((state) => state.updateWebhook);

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return apiClient.post<Webhook>(`/v1/admin/webhooks/${id}/${enabled ? 'enable' : 'disable'}`);
    },
    onSuccess: (data) => updateWebhook(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'webhooks'] });
    },
  });
}

// There's no "send a test ping" endpoint - the real backend action is
// re-delivering the most recent payload to validate the endpoint is reachable.
export function useRetryWebhookDelivery() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const updateWebhook = useAdminStore((state) => state.updateWebhook);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return apiClient.post<Webhook>(`/v1/admin/webhooks/${id}/retry`);
    },
    onSuccess: (data) => updateWebhook(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'webhooks'] });
    },
  });
}

export function useDeleteWebhook() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const removeWebhook = useAdminStore((state) => state.removeWebhook);

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return apiClient.delete<void>(`/v1/admin/webhooks/${id}`);
    },
    onMutate: async ({ id }) => {
      removeWebhook(id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'webhooks'] });
    },
  });
}

// ─── IAM PROFILE & SESSIONS ──────────────────────────────────────────────────

export interface IamUserProfile {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
}

export interface IamSession {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export function useIamProfile() {
  const apiClient = useApiClient();
  return useQuery<IamUserProfile>({
    queryKey: ['iam', 'me', 'profile'],
    queryFn: () => apiClient.get<IamUserProfile>('/v1/iam/me/profile'),
  });
}

export function useUpdateIamProfile() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<IamUserProfile>) => apiClient.patch<IamUserProfile>('/v1/iam/me/profile', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iam', 'me', 'profile'] }),
  });
}

export function useChangePassword() {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: (dto: { currentPassword: string; newPassword: string }) =>
      apiClient.post<{ success: boolean }>('/v1/iam/me/password/change', dto),
  });
}

export function useIamSessions() {
  const apiClient = useApiClient();
  return useQuery<IamSession[]>({
    queryKey: ['iam', 'me', 'sessions'],
    queryFn: () => apiClient.get<IamSession[]>('/v1/iam/me/sessions'),
  });
}

export function useRevokeIamSession() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => apiClient.delete<void>(`/v1/iam/me/sessions/${sessionId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['iam', 'me', 'sessions'] }),
  });
}

// ─── AI AGENTS ───────────────────────────────────────────────────────────────

export interface AiAgent {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRAINING';
  escalationThreshold: number;
  confidenceThreshold: number;
  modelConfig?: { provider: string; model: string; maxTokens: number; temperature: number };
  profile?: { persona: string; tone: string; instructions: string };
  createdAt: string;
}

export function useAiAgents() {
  const apiClient = useApiClient();
  return useQuery<AiAgent[]>({
    queryKey: ['admin', 'ai-agents'],
    queryFn: () => apiClient.get<AiAgent[]>('/v1/ai-agents'),
  });
}

export function useAiAgentById(id: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<AiAgent>({
    queryKey: ['admin', 'ai-agents', id],
    queryFn: () => apiClient.get<AiAgent>(`/v1/ai-agents/${id}`),
    enabled: !!id,
  });
}

export function useCreateAiAgent() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; slug: string; confidenceThreshold?: number; escalationThreshold?: number }) =>
      apiClient.post<AiAgent>('/v1/ai-agents', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'ai-agents'] }),
  });
}

export function useUpdateAiAgent() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Partial<AiAgent> & { id: string }) =>
      apiClient.put<AiAgent>(`/v1/ai-agents/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai-agents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai-agents', id] });
    },
  });
}

export function useUpdateAiAgentProfile() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; persona: string; tone: string; instructions: string }) =>
      apiClient.put<AiAgent>(`/v1/ai-agents/${id}/profile`, dto),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['admin', 'ai-agents', id] }),
  });
}

export function useUpdateAiAgentModelConfig() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...dto
    }: {
      id: string;
      provider: string;
      model: string;
      maxTokens: number;
      temperature: number;
    }) => apiClient.put<AiAgent>(`/v1/ai-agents/${id}/model-config`, dto),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['admin', 'ai-agents', id] }),
  });
}

export function useDeleteAiAgent() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/ai-agents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'ai-agents'] }),
  });
}

export interface AiUsageRecord {
  agentId: string;
  date: string;
  requestCount: number;
  tokensUsed: number;
  estimatedCost: number;
}

export function useAiUsage(params?: { agentId?: string; startDate?: string; endDate?: string }) {
  const apiClient = useApiClient();
  return useQuery<AiUsageRecord[]>({
    queryKey: ['admin', 'ai-usage', params],
    queryFn: () => apiClient.get<AiUsageRecord[]>('/v1/ai-usage', { query: params as Record<string, string> }),
  });
}

// ─── ANALYTICS — EXTENDED ────────────────────────────────────────────────────

export interface AgentMetrics {
  agentId: string;
  displayName: string;
  conversationsHandled: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  csatScore: number;
  ticketsResolved: number;
}

export function useAnalyticsAgentMetrics(timeRange: string) {
  const apiClient = useApiClient();
  return useQuery<AgentMetrics[]>({
    queryKey: ['admin', 'analytics', 'agents', timeRange],
    queryFn: () => apiClient.get<AgentMetrics[]>('/v1/analytics/dashboard/agents', { query: { timeRange } }),
  });
}

export function useAnalyticsAgentDetail(agentId: string | undefined, timeRange: string) {
  const apiClient = useApiClient();
  return useQuery<AgentMetrics>({
    queryKey: ['admin', 'analytics', 'agents', agentId, timeRange],
    queryFn: () =>
      apiClient.get<AgentMetrics>(`/v1/analytics/dashboard/agents/${agentId}`, { query: { timeRange } }),
    enabled: !!agentId,
  });
}

export interface RealtimeLiveCounters {
  openConversations: number;
  activeAgents: number;
  waitingConversations: number;
  aiHandledToday: number;
  slaBreachesToday: number;
}

export function useRealtimeLiveCounters() {
  const apiClient = useApiClient();
  return useQuery<RealtimeLiveCounters>({
    queryKey: ['admin', 'analytics', 'realtime', 'live-counters'],
    queryFn: () => apiClient.get<RealtimeLiveCounters>('/v1/analytics/realtime/live-counters'),
    refetchInterval: 30000,
  });
}

export interface RealtimeLiveSla {
  slaBreachCount: number;
  atRiskCount: number;
  onTrackCount: number;
  breachRatePercent: number;
}

export function useRealtimeLiveSla() {
  const apiClient = useApiClient();
  return useQuery<RealtimeLiveSla>({
    queryKey: ['admin', 'analytics', 'realtime', 'live-sla'],
    queryFn: () => apiClient.get<RealtimeLiveSla>('/v1/analytics/realtime/live-sla'),
    refetchInterval: 30000,
  });
}

export interface RealtimeLiveAi {
  activeAiSessions: number;
  pendingEscalations: number;
  aiResolutionRateLast1h: number;
  avgConfidenceScore: number;
}

export function useRealtimeLiveAi() {
  const apiClient = useApiClient();
  return useQuery<RealtimeLiveAi>({
    queryKey: ['admin', 'analytics', 'realtime', 'live-ai'],
    queryFn: () => apiClient.get<RealtimeLiveAi>('/v1/analytics/realtime/live-ai'),
    refetchInterval: 30000,
  });
}

export function useAnalyticsReportById(id: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<AnalyticsReport>({
    queryKey: ['admin', 'analytics', 'reports', id],
    queryFn: () => apiClient.get<AnalyticsReport>(`/v1/analytics/reports/${id}`),
    enabled: !!id,
  });
}

export function useUpdateAnalyticsReport() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; name?: string; reportType?: string; timeRange?: string }) =>
      apiClient.put<AnalyticsReport>(`/v1/analytics/reports/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics', 'reports', id] });
    },
  });
}

export interface ReportSchedule {
  id: string;
  reportId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recipients: string[];
  format: 'CSV' | 'PDF';
  active: boolean;
  nextRunAt: string;
}

export function useAnalyticsReportSchedules() {
  const apiClient = useApiClient();
  return useQuery<ReportSchedule[]>({
    queryKey: ['admin', 'analytics', 'report-schedules'],
    queryFn: () => apiClient.get<ReportSchedule[]>('/v1/analytics/reports/schedules/list'),
  });
}

export function useCreateAnalyticsReportSchedule() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<ReportSchedule, 'id' | 'nextRunAt'>) =>
      apiClient.post<ReportSchedule>('/v1/analytics/reports/schedules', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'analytics', 'report-schedules'] }),
  });
}

export function useDeleteAnalyticsReportSchedule() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/analytics/reports/schedules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'analytics', 'report-schedules'] }),
  });
}

// ─── SYSTEM HEALTH — QUEUE DETAILS ───────────────────────────────────────────

export interface QueueDetail extends QueueStats {
  workers: { id: string; status: string; jobId?: string }[];
  failedJobs: { id: string; name: string; failedReason: string; timestamp: number }[];
}

export function useQueueDetail(queueName: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<QueueStats>({
    queryKey: ['admin', 'health', 'queues', queueName],
    queryFn: () => apiClient.get<QueueStats>(`/v1/admin/health/queues/${queueName}`),
    enabled: !!queueName,
    refetchInterval: 10000,
  });
}

export function useQueueWorkers(queueName: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<{ id: string; status: string; jobId?: string }[]>({
    queryKey: ['admin', 'health', 'queues', queueName, 'workers'],
    queryFn: () =>
      apiClient.get<{ id: string; status: string; jobId?: string }[]>(
        `/v1/admin/health/queues/${queueName}/workers`,
      ),
    enabled: !!queueName,
    refetchInterval: 10000,
  });
}

export function useQueueFailedJobs(queueName: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<{ id: string; name: string; failedReason: string; timestamp: number }[]>({
    queryKey: ['admin', 'health', 'queues', queueName, 'failed'],
    queryFn: () =>
      apiClient.get<{ id: string; name: string; failedReason: string; timestamp: number }[]>(
        `/v1/admin/health/queues/${queueName}/failed`,
      ),
    enabled: !!queueName,
  });
}

export function useRetryQueueJob() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queueName, jobId }: { queueName: string; jobId: string }) =>
      apiClient.post<{ success: boolean }>(`/v1/admin/health/queues/${queueName}/jobs/${jobId}/retry`),
    onSuccess: (_, { queueName }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'health', 'queues', queueName, 'failed'] });
    },
  });
}

export interface DeadLetterJob {
  id: string;
  queue: string;
  name: string;
  failedReason: string;
  timestamp: number;
  attemptsMade: number;
}

export function useDeadLetterQueue() {
  const apiClient = useApiClient();
  return useQuery<DeadLetterJob[]>({
    queryKey: ['admin', 'health', 'dead-letter'],
    queryFn: () => apiClient.get<DeadLetterJob[]>('/v1/admin/health/dead-letter'),
  });
}

export function useReplayDeadLetterJob() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => apiClient.post<{ success: boolean }>(`/v1/admin/health/dead-letter/${jobId}/replay`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'health', 'dead-letter'] }),
  });
}

// ─── INCIDENTS — EXTENDED ────────────────────────────────────────────────────

export function useIncidentById(id: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<IncidentAlert>({
    queryKey: ['admin', 'incidents', id],
    queryFn: () => apiClient.get<IncidentAlert>(`/v1/admin/incidents/${id}`),
    enabled: !!id,
  });
}

export function useCreateIncident() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: {
      title: string;
      description?: string;
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      affectedService?: string;
    }) => apiClient.post<IncidentAlert>('/v1/admin/incidents', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'incidents'] }),
  });
}

export function useUpdateIncidentStatus() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'OPEN' | 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
    }) => apiClient.patch<IncidentAlert>(`/v1/admin/incidents/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'incidents'] }),
  });
}

// ─── AUDIT LOG — EXTENDED ────────────────────────────────────────────────────

export type AuditLogType =
  | 'entities'
  | 'settings'
  | 'workflows'
  | 'ai-configuration'
  | 'api-keys'
  | 'security';

export function useAuditLogByType(type: AuditLogType, params?: Record<string, string>) {
  const apiClient = useApiClient();
  return useQuery<{ data: AuditLogRecord[]; total: number }>({
    queryKey: ['admin', 'audit', type, params],
    queryFn: () =>
      apiClient.get<{ data: AuditLogRecord[]; total: number }>(`/v1/admin/audit/${type}`, {
        query: { limit: '50', ...params },
      }),
  });
}

export function useConnectorAuditLog(connectorId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<{ data: AuditLogRecord[]; total: number }>({
    queryKey: ['admin', 'audit', 'connectors', connectorId],
    queryFn: () =>
      apiClient.get<{ data: AuditLogRecord[]; total: number }>(
        `/v1/admin/audit/connectors/${connectorId}`,
        { query: { limit: '50' } },
      ),
    enabled: !!connectorId,
  });
}

export interface AuditView {
  id: string;
  name: string;
  filters: Record<string, unknown>;
}

export function useAuditViews() {
  const apiClient = useApiClient();
  return useQuery<AuditView[]>({
    queryKey: ['admin', 'audit', 'views'],
    queryFn: () => apiClient.get<AuditView[]>('/v1/admin/audit/views'),
  });
}

export function useCreateAuditView() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; filters: Record<string, unknown> }) =>
      apiClient.post<AuditView>('/v1/admin/audit/views', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'audit', 'views'] }),
  });
}

export function useDeleteAuditView() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/admin/audit/views/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'audit', 'views'] }),
  });
}

// ─── OVERRIDES / GOVERNANCE ───────────────────────────────────────────────────

export interface AdminOverride {
  featureKey: string;
  value: unknown;
  reason?: string;
  createdAt: string;
}

export function useAdminOverrides() {
  const apiClient = useApiClient();
  return useQuery<AdminOverride[]>({
    queryKey: ['admin', 'overrides'],
    queryFn: () => apiClient.get<AdminOverride[]>('/v1/admin/overrides'),
  });
}

export function useCreateAdminOverride() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { featureKey: string; value: unknown; reason?: string }) =>
      apiClient.post<AdminOverride>('/v1/admin/overrides', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'overrides'] }),
  });
}

export function useDeleteAdminOverride() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (featureKey: string) => apiClient.delete<void>(`/v1/admin/overrides/${featureKey}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'overrides'] }),
  });
}

export function useGovernanceAiSettings() {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['admin', 'overrides', 'governance', 'ai'],
    queryFn: () => apiClient.get<Record<string, unknown>>('/v1/admin/overrides/governance/ai'),
  });
}

export function useUpdateGovernanceAiSettings() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Record<string, unknown>) =>
      apiClient.patch<Record<string, unknown>>('/v1/admin/overrides/governance/ai', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'overrides', 'governance', 'ai'] }),
  });
}

export function useFeatureAccessList() {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['admin', 'overrides', 'feature-access'],
    queryFn: () => apiClient.get<Record<string, boolean>>('/v1/admin/overrides/feature-access/list'),
  });
}

export function useSetFeatureAccess() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { featureKey: string; enabled: boolean }) =>
      apiClient.post<{ success: boolean }>('/v1/admin/overrides/feature-access', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'overrides', 'feature-access'] }),
  });
}

// ─── KNOWLEDGE BASE — EXTENDED ───────────────────────────────────────────────

export function useKnowledgeDocumentById(id: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<KnowledgeDocument>({
    queryKey: ['admin', 'documents', id],
    queryFn: () => apiClient.get<KnowledgeDocument>(`/v1/knowledge-documents/${id}`),
    enabled: !!id,
  });
}

export function useUpdateKnowledgeDocument() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Partial<KnowledgeDocument> & { id: string }) =>
      apiClient.put<KnowledgeDocument>(`/v1/knowledge-documents/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents', id] });
    },
  });
}

export function usePublishKnowledgeDocument() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publishedAt }: { id: string; publishedAt?: string }) =>
      apiClient.post<KnowledgeDocument>(`/v1/knowledge-documents/${id}/publish`, { publishedAt }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] }),
  });
}

export function useArchiveKnowledgeDocument() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<KnowledgeDocument>(`/v1/knowledge-documents/${id}/archive`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] }),
  });
}

export function useIngestKnowledgeDocument() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<{ jobId: string }>(`/v1/knowledge-documents/${id}/ingest`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] }),
  });
}

export interface KnowledgeDocumentVersion {
  id: string;
  documentId: string;
  version: number;
  title: string;
  createdAt: string;
  createdBy?: string;
}

export function useKnowledgeDocumentVersions(documentId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<KnowledgeDocumentVersion[]>({
    queryKey: ['admin', 'documents', documentId, 'versions'],
    queryFn: () => apiClient.get<KnowledgeDocumentVersion[]>(`/v1/knowledge-versions/document/${documentId}`),
    enabled: !!documentId,
  });
}

export function useCreateKnowledgeCategory() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; slug: string; description?: string; parentId?: string }) =>
      apiClient.post<KnowledgeCategory>('/v1/knowledge-categories', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge-categories'] }),
  });
}

export function useUpdateKnowledgeCategory() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Partial<KnowledgeCategory> & { id: string }) =>
      apiClient.put<KnowledgeCategory>(`/v1/knowledge-categories/${id}`, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge-categories'] }),
  });
}

export function useDeleteKnowledgeCategory() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/knowledge-categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge-categories'] }),
  });
}

export function useUpdateKnowledgeSource() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Partial<KnowledgeSource> & { id: string }) =>
      apiClient.put<KnowledgeSource>(`/v1/knowledge-sources/${id}`, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge-sources'] }),
  });
}

export function useDeleteKnowledgeSource() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/knowledge-sources/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge-sources'] }),
  });
}

export function useSyncKnowledgeSource() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<{ jobId: string }>(`/v1/knowledge-sources/${id}/sync`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'knowledge-sources'] }),
  });
}

// ─── CHANNELS — EXTENDED ─────────────────────────────────────────────────────

export function useChannelById(id: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<CommunicationChannel>({
    queryKey: ['admin', 'channels', id],
    queryFn: () => apiClient.get<CommunicationChannel>(`/v1/channels/${id}`),
    enabled: !!id,
  });
}

export function useCreateChannel() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: {
      name: string;
      channelType: string;
      description?: string;
      config?: Record<string, unknown>;
    }) => apiClient.post<CommunicationChannel>('/v1/channels', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'channels'] }),
  });
}

export function useUpdateChannel() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Partial<CommunicationChannel> & { id: string }) =>
      apiClient.put<CommunicationChannel>(`/v1/channels/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels', id] });
    },
  });
}

export function useChannelConfig(channelId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['admin', 'channels', channelId, 'config'],
    queryFn: () => apiClient.get<Record<string, unknown>>(`/v1/channels/${channelId}/config`),
    enabled: !!channelId,
  });
}

export function useSaveChannelConfig() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, ...config }: { channelId: string } & Record<string, unknown>) =>
      apiClient.post<Record<string, unknown>>(`/v1/channels/${channelId}/config`, config),
    onSuccess: (_, { channelId }) =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels', channelId, 'config'] }),
  });
}

export function useRotateChannelSecrets() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (channelId: string) =>
      apiClient.post<{ webhookSecret: string }>(`/v1/channels/${channelId}/rotate-secrets`),
    onSuccess: (_, channelId) =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels', channelId] }),
  });
}

export function useCheckChannelHealth() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (channelId: string) =>
      apiClient.post<{ status: string; latencyMs: number }>(`/v1/channels/${channelId}/health/check`),
    onSuccess: (_, channelId) =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels', channelId, 'health'] }),
  });
}

export function useChannelHealth(channelId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['admin', 'channels', channelId, 'health'],
    queryFn: () => apiClient.get<{ status: string; latencyMs: number; lastCheckAt: string }>(
      `/v1/channels/${channelId}/health`,
    ),
    enabled: !!channelId,
  });
}

export function useChannelTemplates(channelId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<{ name: string; body: string; language: string }[]>({
    queryKey: ['admin', 'channels', channelId, 'templates'],
    queryFn: () =>
      apiClient.get<{ name: string; body: string; language: string }[]>(
        `/v1/channels/${channelId}/templates`,
      ),
    enabled: !!channelId,
  });
}

export function useCreateChannelTemplate() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      channelId,
      ...dto
    }: {
      channelId: string;
      name: string;
      body: string;
      language: string;
    }) => apiClient.post<{ name: string; body: string; language: string }>(`/v1/channels/${channelId}/templates`, dto),
    onSuccess: (_, { channelId }) =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels', channelId, 'templates'] }),
  });
}

export function useDeleteChannelTemplate() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, name }: { channelId: string; name: string }) =>
      apiClient.delete<void>(`/v1/channels/${channelId}/templates/${encodeURIComponent(name)}`),
    onSuccess: (_, { channelId }) =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'channels', channelId, 'templates'] }),
  });
}

// ─── CONNECTORS — EXTENDED ───────────────────────────────────────────────────

export function useConnectorById(id: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<Connector>({
    queryKey: ['admin', 'connectors', id],
    queryFn: () => apiClient.get<Connector>(`/v1/connectors/${id}`),
    enabled: !!id,
  });
}

export function useConfigureConnector() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & Record<string, unknown>) =>
      apiClient.put<Connector>(`/v1/connectors/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'connectors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'connectors', id] });
    },
  });
}

export function useDeleteConnector() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/connectors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'connectors'] }),
  });
}

export function useImportConnectorOpenApi() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { url?: string; spec?: string; name: string }) =>
      apiClient.post<Connector>('/v1/connectors/import/openapi', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'connectors'] }),
  });
}

export function useMapConnectorCapabilities() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      capabilities,
    }: {
      id: string;
      capabilities: { type: string; endpoint: string; method: string }[];
    }) => apiClient.post<Connector>(`/v1/connectors/${id}/capabilities`, { capabilities }),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['admin', 'connectors', id] }),
  });
}

export function useCheckConnectorHealth() {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post<{ status: string; latencyMs: number }>(`/v1/connectors/${id}/health`),
  });
}

export function useConnectorInstances(connectorId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<{ id: string; instanceName: string; status: string; createdAt: string }[]>({
    queryKey: ['admin', 'connectors', connectorId, 'instances'],
    queryFn: () =>
      apiClient.get<{ id: string; instanceName: string; status: string; createdAt: string }[]>(
        `/v1/connectors/${connectorId}/instances`,
      ),
    enabled: !!connectorId,
  });
}

export function useCreateConnectorInstance() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      connectorId,
      ...dto
    }: {
      connectorId: string;
      instanceName: string;
      config?: Record<string, unknown>;
    }) =>
      apiClient.post<{ id: string; instanceName: string }>(`/v1/connectors/${connectorId}/instances`, dto),
    onSuccess: (_, { connectorId }) =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'connectors', connectorId, 'instances'] }),
  });
}

export function useDeleteConnectorInstance() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ connectorId, instanceId }: { connectorId: string; instanceId: string }) =>
      apiClient.delete<void>(`/v1/connectors/instances/${instanceId}`),
    onSuccess: (_, { connectorId }) =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'connectors', connectorId, 'instances'] }),
  });
}

export function useConnectorWebhooks(connectorId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<{ id: string; url: string; events: string[]; active: boolean }[]>({
    queryKey: ['admin', 'connectors', connectorId, 'webhooks'],
    queryFn: () =>
      apiClient.get<{ id: string; url: string; events: string[]; active: boolean }[]>(
        `/v1/connectors/${connectorId}/webhooks`,
      ),
    enabled: !!connectorId,
  });
}

export function useConnectorExecutionById(executionId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<ConnectorExecution>({
    queryKey: ['admin', 'connectors', 'executions', executionId],
    queryFn: () => apiClient.get<ConnectorExecution>(`/v1/connectors/executions/${executionId}`),
    enabled: !!executionId,
  });
}

// ─── WORKFLOWS — EXTENDED ────────────────────────────────────────────────────

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  triggerType: string;
  steps: Record<string, unknown>[];
  createdAt: string;
}

export function useWorkflowTemplateById(id: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<WorkflowTemplate>({
    queryKey: ['admin', 'workflows', 'templates', id],
    queryFn: () => apiClient.get<WorkflowTemplate>(`/v1/workflows/templates/${id}`),
    enabled: !!id,
  });
}

export function useCreateWorkflowTemplate() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: {
      name: string;
      description?: string;
      triggerType: string;
      steps: Record<string, unknown>[];
    }) => apiClient.post<WorkflowTemplate>('/v1/workflows/templates', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'workflows'] }),
  });
}

export function useUpdateWorkflowTemplate() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Partial<WorkflowTemplate> & { id: string }) =>
      apiClient.put<WorkflowTemplate>(`/v1/workflows/templates/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'workflows'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'workflows', 'templates', id] });
    },
  });
}

export function useDeleteWorkflowTemplate() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/workflows/templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'workflows'] }),
  });
}

export function usePublishWorkflowTemplate() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post<WorkflowTemplate>(`/v1/workflows/templates/${id}/publish`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'workflows'] }),
  });
}

export interface WorkflowApproval {
  id: string;
  executionId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requesterNote?: string;
  decidedAt?: string;
  createdAt: string;
}

export function useWorkflowApprovalsByExecution(executionId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<WorkflowApproval[]>({
    queryKey: ['admin', 'workflows', 'approvals', 'execution', executionId],
    queryFn: () => apiClient.get<WorkflowApproval[]>(`/v1/workflows/approvals/execution/${executionId}`),
    enabled: !!executionId,
  });
}

export function useApproveWorkflow() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      apiClient.post<WorkflowApproval>(`/v1/workflows/approvals/${id}/approve`, { note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'workflows', 'approvals'] }),
  });
}

export function useRejectWorkflow() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      apiClient.post<WorkflowApproval>(`/v1/workflows/approvals/${id}/reject`, { note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'workflows', 'approvals'] }),
  });
}

export function useWorkflowAudit(params?: { workflowId?: string; executionId?: string }) {
  const apiClient = useApiClient();
  return useQuery<{ data: AuditLogRecord[]; total: number }>({
    queryKey: ['admin', 'workflows', 'audit', params],
    queryFn: () =>
      apiClient.get<{ data: AuditLogRecord[]; total: number }>('/v1/workflows/audit', {
        query: params as Record<string, string>,
      }),
  });
}

export interface WorkflowSchedule {
  id: string;
  workflowId: string;
  cronExpression: string;
  active: boolean;
  timezone?: string;
  nextRunAt?: string;
}

export function useWorkflowSchedules() {
  const apiClient = useApiClient();
  return useQuery<WorkflowSchedule[]>({
    queryKey: ['admin', 'workflows', 'schedules'],
    queryFn: () => apiClient.get<WorkflowSchedule[]>('/v1/workflows/schedules'),
  });
}

export function useCreateWorkflowSchedule() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { workflowId: string; cronExpression: string; timezone?: string }) =>
      apiClient.post<WorkflowSchedule>('/v1/workflows/schedules', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'workflows', 'schedules'] }),
  });
}

export function useToggleWorkflowSchedule() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiClient.post<WorkflowSchedule>(`/v1/workflows/schedules/${id}/toggle`, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'workflows', 'schedules'] }),
  });
}

export function useDeleteWorkflowSchedule() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/workflows/schedules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'workflows', 'schedules'] }),
  });
}

// ─── TICKET CATEGORIES ───────────────────────────────────────────────────────

export interface TicketCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export function useTicketCategories() {
  const apiClient = useApiClient();
  return useQuery<TicketCategory[]>({
    queryKey: ['admin', 'ticket-categories'],
    queryFn: () => apiClient.get<TicketCategory[]>('/v1/ticket-categories'),
  });
}

export function useCreateTicketCategory() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; slug: string; description?: string }) =>
      apiClient.post<TicketCategory>('/v1/ticket-categories', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'ticket-categories'] }),
  });
}

export function useUpdateTicketCategory() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Partial<TicketCategory> & { id: string }) =>
      apiClient.put<TicketCategory>(`/v1/ticket-categories/${id}`, dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'ticket-categories'] }),
  });
}

export function useDeleteTicketCategory() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/ticket-categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'ticket-categories'] }),
  });
}

// ─── CUSTOMERS (admin view) ───────────────────────────────────────────────────

export interface AdminCustomer {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  externalId?: string;
  status: string;
  segmentIds: string[];
  createdAt: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  rules?: Record<string, unknown>;
  memberCount: number;
  createdAt: string;
}

export function useAdminCustomers(params?: { search?: string; limit?: number; cursor?: string }) {
  const apiClient = useApiClient();
  return useQuery<{ data: AdminCustomer[]; total: number; nextCursor?: string }>({
    queryKey: ['admin', 'customers', params],
    queryFn: () =>
      apiClient.get<{ data: AdminCustomer[]; total: number; nextCursor?: string }>('/v1/customers', {
        query: { limit: '50', ...params } as Record<string, string>,
      }),
  });
}

export function useAdminCustomerById(id: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<AdminCustomer>({
    queryKey: ['admin', 'customers', id],
    queryFn: () => apiClient.get<AdminCustomer>(`/v1/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateAdminCustomer() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { email?: string; phone?: string; name?: string; externalId?: string }) =>
      apiClient.post<AdminCustomer>('/v1/customers', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] }),
  });
}

export function useUpdateAdminCustomer() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: Partial<AdminCustomer> & { id: string }) =>
      apiClient.put<AdminCustomer>(`/v1/customers/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers', id] });
    },
  });
}

export function useDeleteAdminCustomer() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] }),
  });
}

export function useExportCustomers() {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: (format: 'CSV' | 'JSON') =>
      apiClient.get<Blob>('/v1/customers/export', { query: { format } }),
  });
}

export function useAdminCustomerTimeline(customerId: string | undefined) {
  const apiClient = useApiClient();
  return useQuery<{ type: string; data: Record<string, unknown>; createdAt: string }[]>({
    queryKey: ['admin', 'customers', customerId, 'timeline'],
    queryFn: () =>
      apiClient.get<{ type: string; data: Record<string, unknown>; createdAt: string }[]>(
        `/v1/customers/${customerId}/timeline`,
      ),
    enabled: !!customerId,
  });
}

export function useCustomerSegments() {
  const apiClient = useApiClient();
  return useQuery<CustomerSegment[]>({
    queryKey: ['admin', 'customer-segments'],
    queryFn: () => apiClient.get<CustomerSegment[]>('/v1/customer-segments'),
  });
}

export function useCreateCustomerSegment() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; description?: string; rules?: Record<string, unknown> }) =>
      apiClient.post<CustomerSegment>('/v1/customer-segments', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'customer-segments'] }),
  });
}

export function useDeleteCustomerSegment() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/customer-segments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'customer-segments'] }),
  });
}

// ─── SETTINGS — EXTENDED ─────────────────────────────────────────────────────

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  webhookEnabled: boolean;
  digestEnabled: boolean;
  configuration?: Record<string, any>;
}

export interface SlaSettings {
  id?: string;
  responseTimeTarget: number;
  resolutionTimeTarget: number;
  escalationTimeTarget: number;
  businessHoursOnly: boolean;
  configuration?: any;
}

export const useNotificationSettings = settingsQuery<NotificationSettings>(
  'notifications',
  '/v1/settings/notifications',
);
export const useUpdateNotificationSettings = settingsMutation<Partial<NotificationSettings>>(
  'notifications',
  '/v1/settings/notifications',
);

export const useSlaSettings = settingsQuery<SlaSettings>('sla', '/v1/settings/sla');
export const useUpdateSlaSettings = settingsMutation<Partial<SlaSettings>>('sla', '/v1/settings/sla');

export function useDeleteBusinessHours() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/settings/business-hours/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'business-hours'] }),
  });
}

export function useDeleteFeatureFlag() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/v1/settings/feature-flags/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'settings', 'feature-flags'] }),
  });
}

// ─── HARDENING ────────────────────────────────────────────────────────────────

export function useHardeningCost() {
  const apiClient = useApiClient();
  return useQuery<{ totalCostUsd: number; breakdown: Record<string, number> }>({
    queryKey: ['admin', 'hardening', 'cost'],
    queryFn: () =>
      apiClient.get<{ totalCostUsd: number; breakdown: Record<string, number> }>('/v1/hardening/cost'),
  });
}

export function useReplayOutbox() {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: () => apiClient.post<{ replayed: number }>('/v1/hardening/outbox/replay'),
  });
}
