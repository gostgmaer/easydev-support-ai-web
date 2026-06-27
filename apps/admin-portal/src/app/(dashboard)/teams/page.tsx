'use client';

import * as React from 'react';
import { Users, UserPlus, Archive, Settings, UserMinus, Plus } from 'lucide-react';
import {
  useTeams,
  useCreateTeam,
  useArchiveTeam,
  useAgentProfiles,
  useAddTeamAgent,
  useUpdateTeamAgentRole,
  useRemoveTeamAgent,
} from '../../../hooks/useAdminQueries';
import type { Team } from '../../../store/adminStore';

const MEMBER_ROLES = ['MEMBER', 'LEADER'] as const;

function TeamMembersPanel({ team }: { team: Team }) {
  const { data: agentProfiles = [], isLoading: isAgentsLoading } = useAgentProfiles();
  const addAgentMutation = useAddTeamAgent();
  const updateRoleMutation = useUpdateTeamAgentRole();
  const removeAgentMutation = useRemoveTeamAgent();

  const [selectedAgentId, setSelectedAgentId] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<typeof MEMBER_ROLES[number]>('MEMBER');

  const agentsById = React.useMemo(
    () => new Map(agentProfiles.map((a) => [a.id, a])),
    [agentProfiles],
  );

  const availableAgents = agentProfiles.filter(
    (a) => !team.members.some((m) => m.agentProfileId === a.id),
  );

  React.useEffect(() => {
    if (!selectedAgentId && availableAgents.length > 0) {
      setSelectedAgentId(availableAgents[0].id);
    }
  }, [availableAgents, selectedAgentId]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) return;
    addAgentMutation.mutate(
      { teamId: team.id, agentProfileId: selectedAgentId, role: selectedRole },
      { onSuccess: () => setSelectedAgentId('') },
    );
  };

  return (
    <div className="border-t border-neutral-100 pt-3 mt-3 space-y-3 text-xs">
      <h3 className="font-bold text-neutral-600">Team Members</h3>

      {team.members.length === 0 ? (
        <p className="text-neutral-400 italic">No members assigned yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {team.members.map((member) => (
            <li
              key={member.agentProfileId}
              className="flex items-center justify-between gap-2 p-2 border border-neutral-200 rounded bg-neutral-50/50"
            >
              <span className="font-semibold text-neutral-800 truncate">
                {agentsById.get(member.agentProfileId)?.displayName || member.agentProfileId}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={member.role}
                  onChange={(e) =>
                    updateRoleMutation.mutate({
                      teamId: team.id,
                      agentProfileId: member.agentProfileId,
                      role: e.target.value,
                    })
                  }
                  disabled={updateRoleMutation.isPending}
                  className="border border-neutral-200 rounded px-2 py-1 bg-white text-[11px] font-semibold"
                  aria-label={`Role for ${agentsById.get(member.agentProfileId)?.displayName || member.agentProfileId}`}
                >
                  {MEMBER_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeAgentMutation.mutate({ teamId: team.id, agentProfileId: member.agentProfileId })}
                  disabled={removeAgentMutation.isPending}
                  className="text-neutral-400 hover:text-danger p-1"
                  aria-label={`Remove ${agentsById.get(member.agentProfileId)?.displayName || member.agentProfileId}`}
                >
                  <UserMinus className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isAgentsLoading ? (
        <p className="text-neutral-400">Loading agents...</p>
      ) : availableAgents.length === 0 ? (
        <p className="text-neutral-400 italic">All agent profiles are already on this team.</p>
      ) : (
        <form onSubmit={handleAddMember} className="flex items-end gap-2 pt-2 border-t border-neutral-100">
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor={`add-agent-${team.id}`} className="font-semibold text-neutral-600">Agent</label>
            <select
              id={`add-agent-${team.id}`}
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="border border-neutral-200 rounded p-2 bg-white"
            >
              {availableAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.displayName}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`add-role-${team.id}`} className="font-semibold text-neutral-600">Role</label>
            <select
              id={`add-role-${team.id}`}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as typeof MEMBER_ROLES[number])}
              className="border border-neutral-200 rounded p-2 bg-white"
            >
              {MEMBER_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={addAgentMutation.isPending}
            className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-3 rounded transition disabled:opacity-50 h-[34px]"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </form>
      )}
    </div>
  );
}

export default function TeamsPage() {
  const { data: teams, isLoading, isError } = useTeams();
  const createTeamMutation = useCreateTeam();
  const archiveTeamMutation = useArchiveTeam();

  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [expandedTeamId, setExpandedTeamId] = React.useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createTeamMutation.mutate(
      { name, description: description || undefined, department: department || undefined },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          setDepartment('');
          setShowCreateForm(false);
        },
      },
    );
  };

  const handleArchive = (id: string, teamName: string) => {
    if (confirm(`Archive team "${teamName}"? This cannot be undone.`)) {
      archiveTeamMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="Support Teams List">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Support Teams</h1>
          <p className="text-xs text-neutral-500">Manage support queues, member assignments, and routing rules.</p>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create Team</span>
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="team-name" className="font-bold text-neutral-600">Team Name</label>
              <input
                id="team-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Billing & Payments"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="team-department" className="font-bold text-neutral-600">Department</label>
              <input
                id="team-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Customer Success"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="team-description" className="font-bold text-neutral-600">Description</label>
              <input
                id="team-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createTeamMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-3.5 py-2 rounded-md disabled:opacity-60"
          >
            {createTeamMutation.isPending ? 'Creating...' : 'Save Team'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-xs text-neutral-400">Loading teams...</p>}
      {isError && <p className="text-xs text-danger-600">Failed to load teams.</p>}

      {/* Grid of Teams cards */}
      {teams && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.length === 0 ? (
            <p className="text-xs text-neutral-400 italic">No teams configured yet.</p>
          ) : (
            teams.map((team) => (
              <div key={team.id} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 bg-primary-50 text-primary-600 rounded-md flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-neutral-900">{team.name}</h2>
                          {team.name === 'General Support' && (
                            <span className="bg-primary-100 text-primary-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Default</span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block">{team.members.length} active members</span>
                      </div>
                    </div>

                    <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                      team.isActive ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'
                    }`}>
                      {team.isActive ? 'active' : 'archived'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                    <div className="flex justify-between items-center">
                      <span>Department</span>
                      <span className="font-bold text-neutral-800">{team.department || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Routing Rules</span>
                      <span className="font-semibold text-neutral-800">
                        {team.rules.length > 0 ? `${team.rules.length} configured` : 'None configured'}
                      </span>
                    </div>
                  </div>
                </div>

                {team.isActive && (
                  <div className="flex items-center gap-2 border-t border-neutral-100 pt-3 text-xs">
                    <button
                      onClick={() => setExpandedTeamId((cur) => (cur === team.id ? null : team.id))}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border rounded font-semibold transition border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      aria-expanded={expandedTeamId === team.id}
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Members</span>
                    </button>
                    <button
                      onClick={() => handleArchive(team.id, team.name)}
                      disabled={archiveTeamMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border rounded font-semibold transition border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-50"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>
                )}

                {expandedTeamId === team.id && <TeamMembersPanel team={team} />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
