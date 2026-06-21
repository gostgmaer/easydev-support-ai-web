'use client';

import * as React from 'react';
import { Users, UserPlus, Settings, CheckCircle2, XCircle } from 'lucide-react';

interface SupportTeam {
  id: string;
  name: string;
  membersCount: number;
  capacityRule: string; // e.g. "Max 5 active tickets per agent"
  assignmentRule: 'round-robin' | 'least-busy' | 'skills-based';
  status: 'active' | 'inactive';
}

export default function TeamsPage() {
  const [teams, setTeams] = React.useState<SupportTeam[]>([
    { id: 'team-1', name: 'Billing & Payments', membersCount: 6, capacityRule: 'Max 3 open tickets', assignmentRule: 'least-busy', status: 'active' },
    { id: 'team-2', name: 'Technical Tier-2', membersCount: 12, capacityRule: 'Max 5 open tickets', assignmentRule: 'skills-based', status: 'active' },
    { id: 'team-3', name: 'VIP Retention', membersCount: 4, capacityRule: 'Max 2 open tickets', assignmentRule: 'round-robin', status: 'active' },
  ]);

  const handleToggleStatus = (id: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t))
    );
  };

  return (
    <div className="space-y-6" role="region" aria-label="Support Teams List">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Support Teams</h1>
          <p className="text-xs text-neutral-500">Manage support queues, member capacities, and automated routing rules.</p>
        </div>
        <button
          onClick={() => alert('New team creation form')}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create Team</span>
        </button>
      </div>

      {/* Grid of Teams cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 bg-primary-50 text-primary-600 rounded-md flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900">{team.name}</h2>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">{team.membersCount} active members</span>
                  </div>
                </div>

                <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                  team.status === 'active' ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'
                }`}>
                  {team.status}
                </span>
              </div>

              {/* Specifications List */}
              <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                <div className="flex justify-between items-center">
                  <span>Routing Strategy</span>
                  <span className="font-bold text-neutral-800 capitalize">{team.assignmentRule.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Capacity Limit</span>
                  <span className="font-semibold text-neutral-800">{team.capacityRule}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center gap-2 border-t border-neutral-100 pt-3 text-xs">
              <button
                onClick={() => handleToggleStatus(team.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 border rounded font-semibold transition ${
                  team.status === 'active'
                    ? 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/20'
                    : 'border-success/30 bg-success/10 text-success hover:bg-success/20'
                }`}
              >
                {team.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => alert(`Edit config for team: ${team.name}`)}
                className="p-1.5 border border-neutral-200 text-neutral-500 hover:bg-neutral-50 rounded"
                title="Team Settings"
                aria-label="Team settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
