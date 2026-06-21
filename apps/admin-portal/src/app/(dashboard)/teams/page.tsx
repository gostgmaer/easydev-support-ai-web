'use client';

import * as React from 'react';
import { Users, UserPlus, Archive } from 'lucide-react';
import { useTeams, useCreateTeam, useArchiveTeam } from '../../../hooks/useAdminQueries';

export default function TeamsPage() {
  const { data: teams, isLoading, isError } = useTeams();
  const createTeamMutation = useCreateTeam();
  const archiveTeamMutation = useArchiveTeam();

  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [department, setDepartment] = React.useState('');

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
                      <div>
                        <h2 className="text-sm font-bold text-neutral-900">{team.name}</h2>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">{team.members.length} active members</span>
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
                      onClick={() => handleArchive(team.id, team.name)}
                      disabled={archiveTeamMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border rounded font-semibold transition border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-50"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
