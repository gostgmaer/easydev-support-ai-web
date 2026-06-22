'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Workflow, ToggleLeft, ToggleRight } from 'lucide-react';
import { useWorkflowsList, useToggleWorkflow, useWorkflowExecutions } from '@/hooks/useAdminQueries';
import type { WorkflowRule } from '@/store/adminStore';

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

  const [activeTab, setActiveTab] = React.useState<'list' | 'templates' | 'executions' | 'approvals'>('list');

  React.useEffect(() => {
    if (pathname.includes('/templates')) {
      setActiveTab('templates');
    } else if (pathname.includes('/executions')) {
      setActiveTab('executions');
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

  const systemTemplates = workflows.filter((w) => w.isSystem);

  return (
    <div className="space-y-6" role="region" aria-label="Workflow Automation Configurator">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Automation Workflows</h1>
          <p className="text-xs text-neutral-500">Configure triggers, conditions, and automated actions to claim or resolve tickets.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-md text-xs font-bold self-start md:self-center gap-1">
          {(['list', 'templates', 'executions', 'approvals'] as const).map((tab) => (
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

        {/* 2. TEMPLATES TAB - the built-in/system-provided workflow definitions */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Built-in Templates</h2>
            {systemTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {systemTemplates.map((temp) => (
                  <div key={temp.id} className="p-5 border border-neutral-200 rounded-lg flex flex-col justify-between bg-neutral-50/50 space-y-4 text-xs">
                    <div className="space-y-2">
                      <span className="font-bold text-neutral-800 block">{temp.name}</span>
                      <span className="text-neutral-500 block leading-normal">{temp.description || 'No description provided.'}</span>
                    </div>
                    <button
                      onClick={() => toggleMutation.mutate({ id: temp.id, status: temp.status })}
                      className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 rounded transition"
                    >
                      {temp.status === 'ACTIVE' ? 'Pause Template' : 'Activate Template'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic py-6 text-center">No built-in templates configured for this tenant.</p>
            )}
          </div>
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

        {/* 4. APPROVALS TAB - the real backend only exposes approvals per-execution
            (GET /v1/workflows/approvals/execution/:id), not a tenant-wide pending
            list, so this is an honest stub rather than a fake aggregation. */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Workflows Awaiting Approval</h2>
            <p className="text-xs text-neutral-400 italic py-6 text-center">
              A tenant-wide pending-approvals view isn&apos;t available yet - check the Executions tab and open an execution to review its approvals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
