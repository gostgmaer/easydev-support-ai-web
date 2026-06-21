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
  category: string;
  status: 'active' | 'inactive' | 'error';
  health: number;
  logsCount: number;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  sourceType: 'website' | 'pdf' | 'faq';
  status: 'published' | 'draft' | 'archived';
  version: number;
}

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  status: 'active' | 'draft';
  executionCount: number;
}

export interface IncidentAlert {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
}

// 2. Combined Store State
interface AdminState {
  metrics: SystemMetric;
  connectors: Connector[];
  documents: KnowledgeDocument[];
  workflows: WorkflowRule[];
  incidents: IncidentAlert[];
  isGlobalSearchOpen: boolean;
  activeNotificationsCount: number;
  
  // Actions
  setMetrics: (metrics: SystemMetric) => void;
  setConnectors: (connectors: Connector[]) => void;
  updateConnectorStatus: (id: string, status: Connector['status']) => void;
  setDocuments: (docs: KnowledgeDocument[]) => void;
  addDocument: (doc: KnowledgeDocument) => void;
  setWorkflows: (workflows: WorkflowRule[]) => void;
  toggleWorkflowStatus: (id: string) => void;
  setIncidents: (incidents: IncidentAlert[]) => void;
  resolveIncident: (id: string) => void;
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
  workflows: [],
  incidents: [],
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
  setWorkflows: (workflows) => set({ workflows }),
  toggleWorkflowStatus: (id) =>
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, status: w.status === 'active' ? 'draft' : 'active' } : w
      ),
    })),
  setIncidents: (incidents) => set({ incidents }),
  resolveIncident: (id) =>
    set((state) => ({
      incidents: state.incidents.map((i) => (i.id === id ? { ...i, status: 'resolved' } : i)),
    })),
  setGlobalSearchOpen: (isGlobalSearchOpen) => set({ isGlobalSearchOpen }),
  clearNotifications: () => set({ activeNotificationsCount: 0 }),
}));
