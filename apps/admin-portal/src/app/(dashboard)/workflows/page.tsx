'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Workflow, ToggleLeft, ToggleRight, Clock, Plus, Trash2, Power, Pencil, SendHorizonal, X } from 'lucide-react';
import {
  useWorkflowsList,
  useToggleWorkflow,
  useWorkflowExecutions,
  useWorkflowSchedules,
  useCreateWorkflowSchedule,
  useToggleWorkflowSchedule,
  useDeleteWorkflowSchedule,
  useCreateWorkflowTemplate,
  useUpdateWorkflowTemplate,
  useDeleteWorkflowTemplate,
  usePublishWorkflowTemplate,
  useWorkflowApprovalsByExecution,
  useApproveWorkflow,
  useRejectWorkflow,
  useWorkflowAudit,
  useWorkflowTemplateById,
} from '@/hooks/useAdminQueries';
import type { WorkflowRule } from '@/store/adminStore';
import type { WorkflowTemplate } from '@/hooks/useAdminQueries';

const STATUS_TONE: Record<WorkflowRule['status'], string> = {
  ACTIVE: 'text-success bg-success/15',
  PAUSED: 'text-warning bg-warning/15',
  DRAFT: 'text-neutral-400 bg-neutral-100',
  ARCHIVED: 'text-neutral-500 bg-neutral-100',
  FAILED: 'text-danger bg-danger/15',
  COMPLETED: 'text-info bg-info/15',
};

export default function WorkflowsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: workflows = [], isLoading } = useWorkflowsList();
  const toggleMutation = useToggleWorkflow();
  const { data: executions = [], isLoading: isExecutionsLoading } = useWorkflowExecutions();

  const [activeTab, setActiveTab] = React.useState<'list' | 'templates' | 'executions' | 'schedules' | 'approvals'>('list');

  React.useEffect(() => {
    if (pathname.includes('/templates')) {
      setActiveTab('templates');
    } else if (pathname.includes('/executions')) {
      setActiveTab('executions');
    } else if (pathname.includes('/schedules')) {
      setActiveTab('schedules');
    } else if (pathname.includes('/approvals')) {
      setActiveTab('approvals');
    } else {
      setActiveTab('list');
    }
  }, [pathname]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'list') {
      router.push('/workflows');
    } else {
      router.push(`/workflows/${tab}`);
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="Workflow Automation Configurator">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Automation Workflows</h1>
          <p className="text-xs text-neutral-500">Configure triggers, conditions, and automated actions to claim or resolve tickets.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-neutral-100 p-1 rounded-md text-xs font-bold self-start md:self-center gap-1">
          {(['list', 'templates', 'executions', 'schedules', 'approvals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md capitalize transition ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Viewport */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs min-h-[300px]">
        {/* 1. LIST TAB */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Workflow Definitions</h2>

            {isLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading workflows list...</p>
            ) : workflows.length > 0 ? (
              <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
                <table className="w-full text-left divide-y divide-neutral-100">
                  <thead className="bg-neutral-50 font-bold text-neutral-500">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {workflows.map((flow) => (
                      <tr key={flow.id}>
                        <td className="p-3 font-semibold text-neutral-800">{flow.name}</td>
                        <td className="p-3">{flow.workflowType}</td>
                        <td className="p-3">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.25 rounded ${STATUS_TONE[flow.status]}`}>
                            {flow.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => toggleMutation.mutate({ id: flow.id, status: flow.status })}
                            className="p-1 text-neutral-500 hover:text-primary-600"
                            title="Toggle Workflow Status"
                            aria-label={`Toggle status for ${flow.name}`}
                          >
                            {flow.status === 'ACTIVE' ? <ToggleRight className="h-5 w-5 text-success" /> : <ToggleLeft className="h-5 w-5 text-neutral-400" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-neutral-400">
                <Workflow className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                <p>No workflows defined yet.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <WorkflowTemplatesTab workflows={workflows} toggleMutation={toggleMutation} />
        )}

        {/* 3. EXECUTIONS TAB */}
        {activeTab === 'executions' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Execution History</h2>
            {isExecutionsLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading executions...</p>
            ) : executions.length > 0 ? (
              <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
                <table className="w-full text-left divide-y divide-neutral-100">
                  <thead className="bg-neutral-50 font-bold text-neutral-500">
                    <tr>
                      <th className="p-3">Workflow ID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Started</th>
                      <th className="p-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {executions.map((exec: any) => (
                      <tr key={exec.id}>
                        <td className="p-3 font-semibold text-neutral-800">{exec.workflowId}</td>
                        <td className="p-3">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.25 rounded ${
                            exec.executionStatus === 'COMPLETED' ? 'text-success bg-success/15' :
                            exec.executionStatus === 'FAILED' ? 'text-danger bg-danger/15' : 'text-neutral-500 bg-neutral-100'
                          }`}>
                            {exec.executionStatus}
                          </span>
                        </td>
                        <td className="p-3">{exec.startedAt ? new Date(exec.startedAt).toLocaleString() : '—'}</td>
                        <td className="p-3">{exec.executionTimeMs ? `${exec.executionTimeMs}ms` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic py-6 text-center">No workflow executions recorded yet.</p>
            )}
          </div>
        )}

        {/* 4. SCHEDULES TAB */}
        {activeTab === 'schedules' && (
          <WorkflowSchedulesTab workflows={workflows} />
        )}

        {/* 5. APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <WorkflowApprovalsTab />
        )}
      </div>
    </div>
  );
}

// ─── WORKFLOW APPROVALS TAB ──────────────────────────────────────────────────

function WorkflowApprovalsTab() {
  const [executionId, setExecutionId] = React.useState('');
  const [lookupId, setLookupId] = React.useState('');
  const { data: approvals = [], isLoading } = useWorkflowApprovalsByExecution(lookupId || undefined);
  const { data: auditData, isLoading: auditLoading } = useWorkflowAudit();
  const approveMutation = useApproveWorkflow();
  const rejectMutation = useRejectWorkflow();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Execution Approvals</h2>
        <div className="flex items-center gap-2 max-w-lg">
          <input
            value={executionId}
            onChange={(e) => setExecutionId(e.target.value)}
            placeholder="Enter execution ID…"
            className="flex-1 border border-neutral-200 rounded p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={() => setLookupId(executionId.trim())}
            disabled={!executionId.trim()}
            className="text-xs font-bold bg-neutral-800 text-white rounded px-3 py-2 hover:bg-neutral-900 disabled:opacity-50"
          >
            Look up
          </button>
          {lookupId && <button onClick={() => { setLookupId(''); setExecutionId(''); }} className="text-xs text-neutral-400 hover:text-neutral-700">Clear</button>}
        </div>
      </div>

      {lookupId && (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-xs text-neutral-400 animate-pulse">Loading approvals…</p>
          ) : approvals.length === 0 ? (
            <p className="text-xs text-neutral-400 italic">No approvals found for this execution.</p>
          ) : (
            <div className="space-y-2">
              {approvals.map((ap: { id: string; status: string; stepName?: string; createdAt: string }) => (
                <div key={ap.id} className="flex items-center justify-between border border-neutral-200 rounded p-3 text-xs bg-white">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-neutral-800">{ap.stepName || ap.id}</span>
                    <p className="text-[10px] text-neutral-400">{new Date(ap.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${ap.status === 'APPROVED' ? 'bg-success/15 text-success' : ap.status === 'REJECTED' ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'}`}>
                      {ap.status}
                    </span>
                    {ap.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => approveMutation.mutate({ id: ap.id })}
                          disabled={approveMutation.isPending}
                          className="text-xs font-bold text-success border border-success/30 rounded px-2 py-1 hover:bg-success/10 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate({ id: ap.id })}
                          disabled={rejectMutation.isPending}
                          className="text-xs font-bold text-danger border border-danger/30 rounded px-2 py-1 hover:bg-danger/10 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-neutral-100 pt-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Workflow Audit Log</h2>
        {auditLoading ? (
          <p className="text-xs text-neutral-400 animate-pulse">Loading audit…</p>
        ) : !auditData || auditData.data.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">No audit events.</p>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {auditData.data.slice(0, 30).map((entry: { id: string; action: string; actorId?: string; createdAt: string }) => (
              <div key={entry.id} className="flex items-center justify-between border border-neutral-100 rounded px-3 py-2 text-xs bg-white">
                <span className="font-semibold text-neutral-700 capitalize">{entry.action.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                  {entry.actorId && <span>{entry.actorId}</span>}
                  <span>{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WORKFLOW TEMPLATES TAB ───────────────────────────────────────────────────

const TRIGGER_TYPES = ['TICKET_CREATED', 'TICKET_UPDATED', 'CONVERSATION_OPENED', 'CONVERSATION_RESOLVED', 'SLA_BREACHED', 'MANUAL', 'CRON'] as const;

const TEMPLATE_STATUS_TONE: Record<string, string> = {
  ACTIVE: 'text-success bg-success/15',
  DRAFT: 'text-neutral-400 bg-neutral-100',
  PAUSED: 'text-warning bg-warning/15',
  ARCHIVED: 'text-neutral-500 bg-neutral-100',
};

function WorkflowTemplatesTab({
  workflows,
  toggleMutation,
}: {
  workflows: WorkflowRule[];
  toggleMutation: ReturnType<typeof useToggleWorkflow>;
}) {
  const createMutation = useCreateWorkflowTemplate();
  const updateMutation = useUpdateWorkflowTemplate();
  const deleteMutation = useDeleteWorkflowTemplate();
  const publishMutation = usePublishWorkflowTemplate();

  const [isCreating, setIsCreating] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);
  const { data: templateDetail, isLoading: isTemplateDetailLoading } = useWorkflowTemplateById(selectedTemplateId ?? undefined);
  const [form, setForm] = React.useState({ name: '', description: '', triggerType: 'TICKET_CREATED', stepsJson: '[]' });
  const [formError, setFormError] = React.useState('');

  const systemTemplates = workflows.filter((w) => w.isSystem);
  const customTemplates = workflows.filter((w) => !w.isSystem);

  const resetForm = () => {
    setForm({ name: '', description: '', triggerType: 'TICKET_CREATED', stepsJson: '[]' });
    setFormError('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    let steps: Record<string, unknown>[];
    try {
      steps = JSON.parse(form.stepsJson);
      if (!Array.isArray(steps)) throw new Error('Must be an array');
      setFormError('');
    } catch {
      setFormError('Steps must be a valid JSON array');
      return;
    }
    createMutation.mutate(
      { name: form.name.trim(), description: form.description.trim() || undefined, triggerType: form.triggerType, steps },
      { onSuccess: () => { setIsCreating(false); resetForm(); } },
    );
  };

  const handleEditStart = (wf: WorkflowRule) => {
    setEditingId(wf.id);
    setForm({ name: wf.name, description: wf.description ?? '', triggerType: wf.workflowType, stepsJson: '[]' });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    let steps: Record<string, unknown>[];
    try {
      steps = JSON.parse(form.stepsJson);
      if (!Array.isArray(steps)) throw new Error('Must be array');
      setFormError('');
    } catch {
      setFormError('Steps must be a valid JSON array');
      return;
    }
    updateMutation.mutate(
      { id: editingId, name: form.name.trim(), description: form.description.trim() || undefined, steps },
      { onSuccess: () => { setEditingId(null); resetForm(); } },
    );
  };

  return (
    <div className="space-y-6 text-xs">
      {/* ── Custom templates ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold uppercase tracking-wider text-neutral-400">Custom Templates ({customTemplates.length})</h2>
          <button
            onClick={() => { setIsCreating((v) => !v); setEditingId(null); resetForm(); }}
            className="flex items-center gap-1.5 rounded bg-primary-600 hover:bg-primary-700 px-3 py-1.5 text-[11px] font-bold text-white transition"
          >
            <Plus className="h-3.5 w-3.5" />
            {isCreating ? 'Cancel' : 'Create Template'}
          </button>
        </div>

        {/* Create form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="rounded-lg border border-primary-200 bg-primary-50/20 p-4 space-y-3">
            {formError && <p className="text-danger text-[11px]">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded border border-neutral-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Trigger Type *</label>
                <select value={form.triggerType} onChange={(e) => setForm((f) => ({ ...f, triggerType: e.target.value }))} className="w-full rounded border border-neutral-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {TRIGGER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional" className="w-full rounded border border-neutral-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Steps (JSON array)</label>
                <textarea rows={4} value={form.stepsJson} onChange={(e) => setForm((f) => ({ ...f, stepsJson: e.target.value }))} className="w-full rounded border border-neutral-200 px-2 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreating(false)} className="rounded border border-neutral-200 px-3 py-1.5 text-[11px] text-neutral-600 hover:bg-neutral-50">Cancel</button>
              <button type="submit" disabled={createMutation.isPending} className="rounded bg-primary-600 hover:bg-primary-700 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        )}

        {customTemplates.length === 0 && !isCreating ? (
          <p className="py-8 text-center text-neutral-400 italic">No custom templates yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customTemplates.map((wf) => (
              <div key={wf.id} className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
                {editingId === wf.id ? (
                  <form onSubmit={handleUpdate} className="space-y-2">
                    {formError && <p className="text-danger text-[11px]">{formError}</p>}
                    <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded border border-neutral-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full rounded border border-neutral-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <textarea rows={3} value={form.stepsJson} onChange={(e) => setForm((f) => ({ ...f, stepsJson: e.target.value }))} className="w-full rounded border border-neutral-200 px-2 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <div className="flex gap-2">
                      <button type="submit" disabled={updateMutation.isPending} className="flex-1 rounded bg-primary-600 text-white py-1 font-bold disabled:opacity-50 text-[11px]">
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={() => { setEditingId(null); resetForm(); }} className="px-3 py-1 rounded border border-neutral-200 text-[11px]">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-neutral-800 block">{wf.name}</span>
                        {wf.description && <span className="text-neutral-500 block mt-0.5 text-[11px]">{wf.description}</span>}
                        {wf.workflowType && <span className="mt-1 inline-block font-mono text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500">{wf.workflowType}</span>}
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${TEMPLATE_STATUS_TONE[wf.status] ?? 'text-neutral-400 bg-neutral-100'}`}>
                        {wf.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleEditStart(wf)}
                        className="flex items-center gap-1 rounded border border-neutral-200 px-2 py-1 text-[10px] font-medium text-neutral-600 hover:bg-neutral-50"
                      >
                        <Pencil className="h-3 w-3" />Edit
                      </button>
                      {wf.status === 'DRAFT' && (
                        <button
                          onClick={() => publishMutation.mutate(wf.id)}
                          disabled={publishMutation.isPending}
                          className="flex items-center gap-1 rounded border border-success/30 bg-success/10 px-2 py-1 text-[10px] font-bold text-success hover:bg-success/20 disabled:opacity-50"
                        >
                          <SendHorizonal className="h-3 w-3" />Publish
                        </button>
                      )}
                      {(wf.status === 'ACTIVE' || wf.status === 'PAUSED') && (
                        <button
                          onClick={() => toggleMutation.mutate({ id: wf.id, status: wf.status })}
                          disabled={toggleMutation.isPending}
                          className={`flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-bold disabled:opacity-50 ${wf.status === 'ACTIVE' ? 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/20' : 'border-success/30 bg-success/10 text-success hover:bg-success/20'}`}
                        >
                          <Power className="h-3 w-3" />{wf.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                        </button>
                      )}
                      <button
                        onClick={() => { if (confirm(`Delete "${wf.name}"?`)) deleteMutation.mutate(wf.id); }}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1 rounded border border-danger/20 px-2 py-1 text-[10px] font-bold text-danger hover:bg-danger/5 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />Delete
                      </button>
                      <button
                        onClick={() => setSelectedTemplateId((cur) => cur === wf.id ? null : wf.id)}
                        className="flex items-center gap-1 rounded border border-neutral-200 px-2 py-1 text-[10px] font-medium text-neutral-600 hover:bg-neutral-50"
                      >
                        {selectedTemplateId === wf.id ? 'Hide Detail' : 'View Detail'}
                      </button>
                    </div>
                    {selectedTemplateId === wf.id && (
                      <div className="mt-2 border-t border-neutral-100 pt-2 space-y-1">
                        {isTemplateDetailLoading ? (
                          <p className="text-[10px] text-neutral-400 animate-pulse">Loading…</p>
                        ) : templateDetail ? (
                          <>
                            <p className="text-[10px] text-neutral-500"><span className="font-bold">Status:</span> {templateDetail.status}</p>
                            <p className="text-[10px] text-neutral-500"><span className="font-bold">Trigger:</span> {templateDetail.triggerType}</p>
                            {templateDetail.steps.length > 0 && (
                              <div className="text-[10px] text-neutral-500">
                                <span className="font-bold">Steps ({templateDetail.steps.length}):</span>
                                <pre className="mt-1 bg-neutral-50 rounded p-2 overflow-auto max-h-24 font-mono text-[9px]">{JSON.stringify(templateDetail.steps, null, 2)}</pre>
                              </div>
                            )}
                          </>
                        ) : null}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── System templates ─────────────────────────────────────────────── */}
      {systemTemplates.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-bold uppercase tracking-wider text-neutral-400">Built-in Templates ({systemTemplates.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systemTemplates.map((temp) => (
              <div key={temp.id} className="p-4 border border-neutral-200 rounded-lg flex flex-col justify-between bg-neutral-50/50 space-y-3">
                <div>
                  <span className="font-bold text-neutral-800 block">{temp.name}</span>
                  <span className="text-neutral-500 block leading-normal mt-1 text-[11px]">{temp.description || 'No description provided.'}</span>
                </div>
                <button
                  onClick={() => toggleMutation.mutate({ id: temp.id, status: temp.status })}
                  className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-1.5 rounded transition text-[11px]"
                >
                  {temp.status === 'ACTIVE' ? 'Pause Template' : 'Activate Template'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WORKFLOW SCHEDULES TAB ───────────────────────────────────────────────────

function WorkflowSchedulesTab({ workflows }: { workflows: WorkflowRule[] }) {
  const { data: schedules = [], isLoading } = useWorkflowSchedules();
  const createMutation = useCreateWorkflowSchedule();
  const toggleMutation = useToggleWorkflowSchedule();
  const deleteMutation = useDeleteWorkflowSchedule();
  const [isCreating, setIsCreating] = React.useState(false);
  const [form, setForm] = React.useState({ workflowId: '', cronExpression: '0 9 * * 1-5', timezone: 'UTC' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workflowId || !form.cronExpression) return;
    createMutation.mutate(
      { workflowId: form.workflowId, cronExpression: form.cronExpression, timezone: form.timezone },
      { onSuccess: () => { setIsCreating(false); setForm({ workflowId: '', cronExpression: '0 9 * * 1-5', timezone: 'UTC' }); } },
    );
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <h2 className="font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary-500" />
          <span>Cron Schedules</span>
        </h2>
        <button
          onClick={() => setIsCreating((v) => !v)}
          className="flex items-center gap-1.5 rounded bg-neutral-800 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-neutral-900 transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add Schedule
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Workflow</label>
              <select
                required
                value={form.workflowId}
                onChange={(e) => setForm((f) => ({ ...f, workflowId: e.target.value }))}
                className="w-full rounded border border-neutral-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a workflow...</option>
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Cron Expression</label>
              <input
                required
                type="text"
                value={form.cronExpression}
                onChange={(e) => setForm((f) => ({ ...f, cronExpression: e.target.value }))}
                placeholder="0 9 * * 1-5"
                className="w-full rounded border border-neutral-200 px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">Timezone</label>
              <input
                type="text"
                value={form.timezone}
                onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                placeholder="UTC"
                className="w-full rounded border border-neutral-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setIsCreating(false)} className="rounded border border-neutral-200 px-3 py-1.5 text-[11px] text-neutral-600 hover:bg-neutral-50">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="rounded bg-neutral-800 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-neutral-900 disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-neutral-400 animate-pulse py-4">Loading schedules...</p>
      ) : schedules.length === 0 ? (
        <p className="py-8 text-center text-neutral-400 italic">No cron schedules configured.</p>
      ) : (
        <div className="overflow-x-auto border border-neutral-100 rounded-lg">
          <table className="w-full text-left divide-y divide-neutral-100">
            <thead className="bg-neutral-50 font-bold text-neutral-500">
              <tr>
                <th className="p-3">Workflow</th>
                <th className="p-3">Cron</th>
                <th className="p-3">Timezone</th>
                <th className="p-3">Next Run</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {schedules.map((sched) => {
                const workflow = workflows.find((w) => w.id === sched.workflowId);
                return (
                  <tr key={sched.id}>
                    <td className="p-3 font-semibold text-neutral-800">{workflow?.name ?? sched.workflowId}</td>
                    <td className="p-3 font-mono">{sched.cronExpression}</td>
                    <td className="p-3">{sched.timezone ?? 'UTC'}</td>
                    <td className="p-3">{sched.nextRunAt ? new Date(sched.nextRunAt).toLocaleString() : '—'}</td>
                    <td className="p-3">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${sched.active ? 'text-success bg-success/15' : 'text-neutral-400 bg-neutral-100'}`}>
                        {sched.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleMutation.mutate({ id: sched.id, active: !sched.active })}
                          disabled={toggleMutation.isPending}
                          className="flex items-center gap-1 rounded border border-neutral-200 px-2 py-1 text-[10px] font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                          title={sched.active ? 'Pause schedule' : 'Activate schedule'}
                        >
                          <Power className="h-3 w-3" />
                          {sched.active ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this schedule?')) deleteMutation.mutate(sched.id); }}
                          disabled={deleteMutation.isPending}
                          className="flex items-center gap-1 rounded border border-danger/20 px-2 py-1 text-[10px] font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
