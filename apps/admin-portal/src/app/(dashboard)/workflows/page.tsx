'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Workflow, Play, Plus, ToggleLeft, ToggleRight, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { useWorkflowsList, useToggleWorkflow } from '@/hooks/useAdminQueries';

export default function WorkflowsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: workflows = [], isLoading } = useWorkflowsList();
  const toggleMutation = useToggleWorkflow();

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

  const templates = [
    { name: 'Auto-Assign High Value Tickets', desc: 'Route tickets immediately to retention team if customer is VIP.' },
    { name: 'Out-Of-Hours Auto Reply', desc: 'Send customized email templates when messages arrive outside shifts.' },
    { name: 'SLA Escalation Alert', desc: 'Notify Slack channels when first-response time is within 5 minutes of breach.' },
  ];

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
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Custom Workflows</h2>
              <button
                onClick={() => alert('New workflow builder wizard')}
                className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create Workflow</span>
              </button>
            </div>

            {isLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading workflows list...</p>
            ) : workflows.length > 0 ? (
              <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
                <table className="w-full text-left divide-y divide-neutral-100">
                  <thead className="bg-neutral-50 font-bold text-neutral-500">
                    <tr>
                      <th className="p-3">Rule Name</th>
                      <th className="p-3">Trigger Event</th>
                      <th className="p-3">Executions</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {workflows.map((flow) => (
                      <tr key={flow.id}>
                        <td className="p-3 font-semibold text-neutral-800">{flow.name}</td>
                        <td className="p-3">{flow.trigger}</td>
                        <td className="p-3 font-semibold text-neutral-600">{flow.executionCount} runs</td>
                        <td className="p-3">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.25 rounded ${
                            flow.status === 'active' ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'
                          }`}>
                            {flow.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => toggleMutation.mutate({ id: flow.id })}
                            className="p-1 text-neutral-500 hover:text-primary-600"
                            title="Toggle Workflow Status"
                            aria-label={`Toggle status for ${flow.name}`}
                          >
                            {flow.status === 'active' ? <ToggleRight className="h-5 w-5 text-success" /> : <ToggleLeft className="h-5 w-5 text-neutral-400" />}
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
                <p>No custom workflows defined. Select from templates to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((temp, idx) => (
              <div key={idx} className="p-5 border border-neutral-200 rounded-lg flex flex-col justify-between bg-neutral-50/50 space-y-4 text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-neutral-800 block">{temp.name}</span>
                  <span className="text-neutral-500 block leading-normal">{temp.desc}</span>
                </div>
                <button
                  onClick={() => alert(`Creating rule from template: ${temp.name}`)}
                  className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 rounded transition"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. EXECUTIONS TAB */}
        {activeTab === 'executions' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Execution History Logs</h2>
            <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
              <table className="w-full text-left divide-y divide-neutral-100">
                <thead className="bg-neutral-50 font-bold text-neutral-500">
                  <tr>
                    <th className="p-3">Rule Name</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  <tr>
                    <td className="p-3 font-semibold text-neutral-800">Auto-Assign VIP</td>
                    <td className="p-3"><span className="text-[10px] uppercase font-bold text-success bg-success/15 px-1.5 py-0.25 rounded">success</span></td>
                    <td className="p-3">12:35 PM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Workflows Awaiting Approval</h2>
            <p className="text-xs text-neutral-400 italic py-6 text-center">No actions are currently pending approval.</p>
          </div>
        )}
      </div>
    </div>
  );
}
