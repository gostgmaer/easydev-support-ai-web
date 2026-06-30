'use client';

import * as React from 'react';
import { Globe, Gauge, UserPlus, BarChart2, ChevronDown, Clock, CheckCircle, Star, AlertTriangle, Wifi } from 'lucide-react';
import { useAgentProfiles, useCreateAgentProfile, useUpdateAgentProfile, useDeleteAgentProfile, useProvisionAgentUser, useAgentPerformance, useAgentAvailability, useUpdateAgentAvailability } from '../../../hooks/useAdminQueries';

export default function AgentsPage() {
  const [search, setSearch] = React.useState('');
  const { data: agents, isLoading, isError } = useAgentProfiles(search || undefined);
  const provisionAgentMutation = useProvisionAgentUser();
  const createAgentMutation = useCreateAgentProfile();
  const [isCreating, setIsCreating] = React.useState(false);
  const [newDisplayName, setNewDisplayName] = React.useState('');
  const [newEmployeeCode, setNewEmployeeCode] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim() || !newEmail.trim() || !newPassword.trim()) return;
    
    provisionAgentMutation.mutate(
      { email: newEmail.trim(), name: newDisplayName.trim(), password: newPassword },
      {
        onSuccess: (data) => {
          createAgentMutation.mutate(
            {
              userId: data.id,
              displayName: newDisplayName.trim(),
              employeeCode: newEmployeeCode.trim() || undefined,
            },
            {
              onSuccess: () => {
                setIsCreating(false);
                setNewDisplayName('');
                setNewEmployeeCode('');
                setNewEmail('');
                setNewPassword('');
              },
            }
          );
        },
      }
    );
  };

  return (
    <div className="space-y-6" role="region" aria-label="Support Agents List">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Support Agents</h1>
          <p className="text-xs text-neutral-500">Agent profiles, capacity limits, and account status across the tenant.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <label htmlFor="agent-search-input" className="sr-only">Search agents</label>
            <input
              id="agent-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents..."
              className="text-xs rounded border border-neutral-200 px-3 py-2 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 w-60"
            />
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-primary-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Agent
          </button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateAgent} className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900">Create New Agent Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="block text-xs font-semibold text-neutral-700">Display Name</label>
              <input
                id="displayName"
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full text-xs rounded border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-neutral-700">Email Address (for IAM Login)</label>
              <input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full text-xs rounded border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-neutral-700">Initial Password</label>
              <input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Required for login"
                className="w-full text-xs rounded border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="employeeCode" className="block text-xs font-semibold text-neutral-700">Employee Code (Optional)</label>
              <input
                id="employeeCode"
                type="text"
                value={newEmployeeCode}
                onChange={(e) => setNewEmployeeCode(e.target.value)}
                placeholder="e.g. EMP-1234"
                className="w-full text-xs rounded border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAgentMutation.isPending || provisionAgentMutation.isPending || !newDisplayName.trim() || !newEmail.trim() || !newPassword.trim()}
              className="bg-neutral-900 text-white px-4 py-2 rounded text-xs font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {provisionAgentMutation.isPending || createAgentMutation.isPending ? 'Provisioning...' : 'Provision Agent'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-xs text-neutral-400">Loading agents...</p>}
      {isError && <p className="text-xs text-danger-600">Failed to load agent profiles.</p>}

      {/* Grid of Agents */}
      {agents && (
        agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 italic py-8 text-center">No agent profiles found.</p>
        )
      )}
    </div>
  );
}

function AgentPerformancePanel({ agentId }: { agentId: string }) {
  const { data, isLoading } = useAgentPerformance(agentId);

  if (isLoading) return <p className="text-[10px] text-neutral-400 py-2 text-center animate-pulse">Loading metrics...</p>;
  if (!data) return <p className="text-[10px] text-neutral-400 py-2 text-center">No performance data.</p>;

  const resolutionRate = data.totalConversations > 0
    ? Math.round((data.resolvedConversations / data.totalConversations) * 100)
    : 0;
  const avgResponseMin = Math.round(data.averageResponseTimeSeconds / 60);
  const avgResolutionHr = (data.averageResolutionTimeSeconds / 3600).toFixed(1);

  return (
    <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2">
      <div className="p-2 bg-primary-50 border border-primary-100 rounded-md text-center">
        <span className="text-[9px] uppercase font-bold text-primary-500 flex items-center justify-center gap-1 mb-0.5">
          <CheckCircle className="h-2.5 w-2.5" /> Resolution
        </span>
        <span className="text-sm font-extrabold text-primary-800">{resolutionRate}%</span>
        <span className="text-[9px] text-primary-400 block">{data.resolvedConversations}/{data.totalConversations}</span>
      </div>
      <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-md text-center">
        <span className="text-[9px] uppercase font-bold text-neutral-400 flex items-center justify-center gap-1 mb-0.5">
          <Clock className="h-2.5 w-2.5" /> Avg Response
        </span>
        <span className="text-sm font-extrabold text-neutral-800">{avgResponseMin}m</span>
        <span className="text-[9px] text-neutral-400 block">first reply</span>
      </div>
      <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-md text-center">
        <span className="text-[9px] uppercase font-bold text-neutral-400 flex items-center justify-center gap-1 mb-0.5">
          <Clock className="h-2.5 w-2.5" /> Avg Resolution
        </span>
        <span className="text-sm font-extrabold text-neutral-800">{avgResolutionHr}h</span>
        <span className="text-[9px] text-neutral-400 block">per ticket</span>
      </div>
      <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-md text-center">
        {data.csatScore != null ? (
          <>
            <span className="text-[9px] uppercase font-bold text-neutral-400 flex items-center justify-center gap-1 mb-0.5">
              <Star className="h-2.5 w-2.5" /> CSAT
            </span>
            <span className="text-sm font-extrabold text-neutral-800">{data.csatScore.toFixed(1)}</span>
            <span className="text-[9px] text-neutral-400 block">/ 5.0</span>
          </>
        ) : (
          <>
            <span className="text-[9px] uppercase font-bold text-danger-400 flex items-center justify-center gap-1 mb-0.5">
              <AlertTriangle className="h-2.5 w-2.5" /> SLA Breach
            </span>
            <span className="text-sm font-extrabold text-danger-700">{Math.round(data.slaBreachRate * 100)}%</span>
            <span className="text-[9px] text-neutral-400 block">breach rate</span>
          </>
        )}
      </div>
    </div>
  );
}

const AVAILABILITY_STATUSES = ['online', 'offline', 'busy', 'away'] as const;

function AgentAvailabilityPanel({ agentId }: { agentId: string }) {
  const { data, isLoading } = useAgentAvailability(agentId);
  const updateAvailability = useUpdateAgentAvailability();
  const [newStatus, setNewStatus] = React.useState('');

  React.useEffect(() => {
    if (data?.status) setNewStatus(data.status);
  }, [data?.status]);

  if (isLoading) return <p className="text-[10px] text-neutral-400 py-2 animate-pulse">Loading availability...</p>;

  return (
    <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
      <p className="text-[10px] font-bold uppercase text-neutral-500">Availability</p>
      <div className="flex items-center gap-2">
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="border border-neutral-200 rounded p-1 text-xs bg-white flex-1"
        >
          {AVAILABILITY_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button
          disabled={updateAvailability.isPending || newStatus === data?.status}
          onClick={() => updateAvailability.mutate({ agentProfileId: agentId, status: newStatus })}
          className="text-[10px] font-bold bg-neutral-800 text-white rounded px-2 py-1 disabled:opacity-50 hover:bg-neutral-900"
        >
          {updateAvailability.isPending ? '…' : 'Save'}
        </button>
      </div>
      {data?.timezone && (
        <p className="text-[10px] text-neutral-400">Timezone: {data.timezone}</p>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: any }) {
  const updateAgentMutation = useUpdateAgentProfile();
  const deleteAgentMutation = useDeleteAgentProfile();
  const [isEditing, setIsEditing] = React.useState(false);
  const [showPerformance, setShowPerformance] = React.useState(false);
  const [showAvailability, setShowAvailability] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    displayName: agent.displayName,
    employeeCode: agent.employeeCode || '',
    timezone: agent.timezone,
    maxConcurrentConversations: agent.capacity?.maxConcurrentConversations || 5,
    maxOpenTickets: agent.capacity?.maxOpenTickets || 20,
  });

  const handleUpdate = () => {
    updateAgentMutation.mutate({
      id: agent.id,
      data: editForm,
    }, {
      onSuccess: () => setIsEditing(false)
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteAgentMutation.mutate(agent.id);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-neutral-900">Edit Agent</h3>
        <div className="space-y-2">
          <input type="text" value={editForm.displayName} onChange={e => setEditForm({ ...editForm, displayName: e.target.value })} className="w-full text-xs rounded border border-neutral-200 px-2 py-1" placeholder="Display Name" />
          <input type="text" value={editForm.employeeCode} onChange={e => setEditForm({ ...editForm, employeeCode: e.target.value })} className="w-full text-xs rounded border border-neutral-200 px-2 py-1" placeholder="Employee Code" />
          <input type="text" value={editForm.timezone} onChange={e => setEditForm({ ...editForm, timezone: e.target.value })} className="w-full text-xs rounded border border-neutral-200 px-2 py-1" placeholder="Timezone" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-500">Max Conv</label>
              <input type="number" value={editForm.maxConcurrentConversations} onChange={e => setEditForm({ ...editForm, maxConcurrentConversations: parseInt(e.target.value) || 0 })} className="w-full text-xs rounded border border-neutral-200 px-2 py-1" />
            </div>
            <div>
              <label className="text-[10px] text-neutral-500">Max Tickets</label>
              <input type="number" value={editForm.maxOpenTickets} onChange={e => setEditForm({ ...editForm, maxOpenTickets: parseInt(e.target.value) || 0 })} className="w-full text-xs rounded border border-neutral-200 px-2 py-1" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setIsEditing(false)} className="text-xs text-neutral-500 hover:text-neutral-900">Cancel</button>
          <button onClick={handleUpdate} disabled={updateAgentMutation.isPending} className="text-xs bg-primary-600 text-white px-2 py-1 rounded">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
      <div className="space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-sm text-neutral-700">
              {agent.displayName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex flex-col gap-1 items-start">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-neutral-900 truncate">{agent.displayName}</h2>
                {agent.displayName === 'General Support AI' && (
                  <span className="bg-primary-100 text-primary-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Default AI</span>
                )}
              </div>
              {agent.employeeCode && (
                <span className="text-[10px] text-neutral-400 block">{agent.employeeCode}</span>
              )}
            </div>
          </div>
          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded shrink-0">
            {agent.status}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-semibold truncate pt-1 border-t border-neutral-50">
          <Globe className="h-3.5 w-3.5" />
          <span>{agent.timezone}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center pt-2">
          <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-md">
            <span className="text-[9px] uppercase font-bold text-neutral-400 block">Max Conversations</span>
            <span className="text-sm font-extrabold text-neutral-800 mt-1 block">{agent.capacity.maxConcurrentConversations}</span>
          </div>
          <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-md">
            <span className="text-[9px] uppercase font-bold text-neutral-400 block">Max Open Tickets</span>
            <span className="text-sm font-extrabold text-neutral-800 mt-1 block">{agent.capacity.maxOpenTickets}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-semibold">
            <Gauge className="h-3.5 w-3.5" />
            <span>Skill score: {agent.skillScore}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditing(true)} className="text-[10px] text-primary-600 hover:underline">Edit</button>
            <button onClick={handleDelete} className="text-[10px] text-danger hover:underline">Delete</button>
          </div>
        </div>
        <button
          onClick={() => setShowPerformance((v) => !v)}
          className="mt-3 flex w-full items-center justify-center gap-1 text-[10px] font-semibold text-neutral-500 hover:text-neutral-700 border-t border-neutral-100 pt-3 transition-colors"
        >
          <BarChart2 className="h-3 w-3" />
          Performance metrics
          <ChevronDown className={`h-3 w-3 transition-transform ${showPerformance ? 'rotate-180' : ''}`} />
        </button>
        {showPerformance && <AgentPerformancePanel agentId={agent.id} />}
        <button
          onClick={() => setShowAvailability((v) => !v)}
          className="mt-2 flex w-full items-center justify-center gap-1 text-[10px] font-semibold text-neutral-500 hover:text-neutral-700 border-t border-neutral-100 pt-2 transition-colors"
        >
          <Wifi className="h-3 w-3" />
          Availability
          <ChevronDown className={`h-3 w-3 transition-transform ${showAvailability ? 'rotate-180' : ''}`} />
        </button>
        {showAvailability && <AgentAvailabilityPanel agentId={agent.id} />}
      </div>
    </div>
  );
}

