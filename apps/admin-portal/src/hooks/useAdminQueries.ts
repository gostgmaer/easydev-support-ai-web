import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStore, Connector, KnowledgeDocument, WorkflowRule, IncidentAlert, SystemMetric } from '../store/adminStore';
import { useAuthStore } from '@easydev/stores';

const adminRequest = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3333/api';
  const token = useAuthStore.getState().tokens?.accessToken;
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Admin API Error: ${response.statusText}`);
  }
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
