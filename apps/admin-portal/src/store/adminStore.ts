import { create } from 'zustand';

// 1. Types Definitions for Admin Domain
export interface SystemMetric {
  conversationsCount: number;
  openTickets: number;
  slaCompliance: number;
  aiDeflectionRate: number;
  avgResolutionTime: number;
  activeAgentsCount: number;
}

export interface Connector {
  id: string;
  name: string;
  connectorType: string;
  authType: 'NONE' | 'API_KEY' | 'BEARER' | 'BASIC' | 'OAUTH2' | 'HMAC';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'DISABLED' | 'ERROR';
  healthStatus: 'UNKNOWN' | 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  lastError?: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  documentType: 'PDF' | 'DOCX' | 'TXT' | 'CSV' | 'MARKDOWN' | 'FAQ' | 'HTML' | 'WEBPAGE';
  status: 'DRAFT' | 'PROCESSING' | 'INDEXING' | 'ACTIVE' | 'ARCHIVED' | 'FAILED';
  version: number;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description?: string;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  sourceType: string;
  uri?: string;
  description?: string;
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: 'WHATSAPP' | 'EMAIL' | 'WEBCHAT' | 'TELEGRAM' | 'FACEBOOK' | 'INSTAGRAM' | 'SLACK' | 'TEAMS' | 'VOICE';
  provider: string;
  status: 'ACTIVE' | 'INACTIVE';
  isDefault: boolean;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  workflowType: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'FAILED' | 'COMPLETED';
  isSystem: boolean;
}

export interface IncidentAlert {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'MONITORING' | 'RESOLVED';
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  department?: string;
  priority: number;
  isActive: boolean;
  members: { agentProfileId: string; role: string }[];
  rules: { ruleType: string }[];
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  createdAt: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'ACTIVE' | 'DISABLED' | 'FAILING';
  lastDeliveryAt?: string;
  lastDeliveryStatus?: string;
  consecutiveFailures: number;
  createdAt: string;
}

// 2. Combined Store State
interface AdminState {
  metrics: SystemMetric;
  connectors: Connector[];
  documents: KnowledgeDocument[];
  sources: KnowledgeSource[];
  workflows: WorkflowRule[];
  incidents: IncidentAlert[];
  teams: Team[];
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  isGlobalSearchOpen: boolean;
  activeNotificationsCount: number;

  // Actions
  setMetrics: (metrics: SystemMetric) => void;
  setConnectors: (connectors: Connector[]) => void;
  updateConnectorStatus: (id: string, status: Connector['status']) => void;
  setDocuments: (docs: KnowledgeDocument[]) => void;
  addDocument: (doc: KnowledgeDocument) => void;
  removeDocument: (id: string) => void;
  setSources: (sources: KnowledgeSource[]) => void;
  addSource: (source: KnowledgeSource) => void;
  setWorkflows: (workflows: WorkflowRule[]) => void;
  toggleWorkflowStatus: (id: string) => void;
  setIncidents: (incidents: IncidentAlert[]) => void;
  resolveIncident: (id: string) => void;
  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (team: Team) => void;
  setApiKeys: (keys: ApiKey[]) => void;
  addApiKey: (key: ApiKey) => void;
  removeApiKey: (id: string) => void;
  setWebhooks: (webhooks: Webhook[]) => void;
  addWebhook: (webhook: Webhook) => void;
  updateWebhook: (webhook: Webhook) => void;
  removeWebhook: (id: string) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  clearNotifications: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  metrics: {
    conversationsCount: 1420,
    openTickets: 320,
    slaCompliance: 96.5,
    aiDeflectionRate: 42.1,
    avgResolutionTime: 18.5,
    activeAgentsCount: 45,
  },
  connectors: [],
  documents: [],
  sources: [],
  workflows: [],
  incidents: [],
  teams: [],
  apiKeys: [],
  webhooks: [],
  isGlobalSearchOpen: false,
  activeNotificationsCount: 3,

  setMetrics: (metrics) => set({ metrics }),
  setConnectors: (connectors) => set({ connectors }),
  updateConnectorStatus: (id, status) =>
    set((state) => ({
      connectors: state.connectors.map((c) => (c.id === id ? { ...c, status } : c)),
    })),
  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  removeDocument: (id) => set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
  setSources: (sources) => set({ sources }),
  addSource: (source) => set((state) => ({ sources: [source, ...state.sources] })),
  setWorkflows: (workflows) => set({ workflows }),
  toggleWorkflowStatus: (id) =>
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, status: w.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : w
      ),
    })),
  setIncidents: (incidents) => set({ incidents }),
  resolveIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.map((i) => (i.id === id ? { ...i, status: 'RESOLVED' } : i)),
    })),
  setTeams: (teams) => set({ teams }),
  addTeam: (team) => set((state) => ({ teams: [team, ...state.teams] })),
  updateTeam: (team) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === team.id ? team : t)),
    })),
  setApiKeys: (apiKeys) => set({ apiKeys }),
  addApiKey: (key) => set((state) => ({ apiKeys: [key, ...state.apiKeys] })),
  removeApiKey: (id) =>
    set((state) => ({ apiKeys: state.apiKeys.filter((k) => k.id !== id) })),
  setWebhooks: (webhooks) => set({ webhooks }),
  addWebhook: (webhook) => set((state) => ({ webhooks: [webhook, ...state.webhooks] })),
  updateWebhook: (webhook) =>
    set((state) => ({
      webhooks: state.webhooks.map((w) => (w.id === webhook.id ? webhook : w)),
    })),
  removeWebhook: (id) =>
    set((state) => ({ webhooks: state.webhooks.filter((w) => w.id !== id) })),
  setGlobalSearchOpen: (isGlobalSearchOpen) => set({ isGlobalSearchOpen }),
  clearNotifications: () => set({ activeNotificationsCount: 0 }),
}));
