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
  confidenceThreshold: number;
  escalationThreshold: number;
  allowedLanguages?: string[];
  defaultLanguage?: string;
  autoResponseEnabled: boolean;
  autoEscalationEnabled: boolean;
  costLimitDaily?: number;
  costLimitMonthly?: number;
}

export function useAiSettings() {
  const apiClient = useApiClient();
  return useQuery<AiSettings>({
    queryKey: ['admin', 'ai-settings'],
    queryFn: () => apiClient.get<AiSettings>('/v1/settings/ai'),
  });
}

export function useUpdateAiSettings() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<AiSettings>) => apiClient.put<AiSettings>('/v1/settings/ai', dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'ai-settings'] }),
  });
}

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
