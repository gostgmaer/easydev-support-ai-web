'use client';

import * as React from 'react';
import { User, ShieldCheck, Mail, ShieldAlert, Sparkles } from 'lucide-react';

interface AgentItem {
  id: string;
  name: string;
  email: string;
  team: string;
  status: 'online' | 'busy' | 'offline';
  capacity: number;
  activeWorkload: number;
}

export default function AgentsPage() {
  const [agents, setAgents] = React.useState<AgentItem[]>([
    { id: 'agent-1', name: 'John Doe', email: 'john.doe@easydev.com', team: 'Technical Tier-2', status: 'online', capacity: 5, activeWorkload: 3 },
    { id: 'agent-2', name: 'Jane Smith', email: 'jane.smith@easydev.com', team: 'Billing & Payments', status: 'busy', capacity: 3, activeWorkload: 3 },
    { id: 'agent-3', name: 'Bob Miller', email: 'bob.miller@easydev.com', team: 'Technical Tier-2', status: 'offline', capacity: 5, activeWorkload: 0 },
    { id: 'agent-4', name: 'Alice Vance', email: 'alice.vance@easydev.com', team: 'VIP Retention', status: 'online', capacity: 2, activeWorkload: 1 },
  ]);

  const [search, setSearch] = React.useState('');

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.team.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" role="region" aria-label="Support Agents List">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Support Agents</h1>
          <p className="text-xs text-neutral-500">Track agent availability status, active workload metrics, and ticket allocations.</p>
        </div>
        <div className="relative">
          <label htmlFor="agent-search-input" className="sr-only">Search agents</label>
          <input
            id="agent-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents or teams..."
            className="text-xs rounded border border-neutral-200 px-3 py-2 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 w-60"
          />
        </div>
      </div>

      {/* Grid of Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredAgents.map((agent) => {
          const statusColors = {
            online: 'bg-success text-success',
            busy: 'bg-warning text-warning',
            offline: 'bg-neutral-400 text-neutral-400',
          };

          return (
            <div key={agent.id} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Header details */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-sm text-neutral-700">
                      {agent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xs font-bold text-neutral-900 truncate">{agent.name}</h2>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">{agent.team}</span>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={`w-2 h-2 rounded-full ring-4 ring-neutral-50 ${statusColors[agent.status].split(' ')[0]}`} />
                </div>

                {/* Email detail */}
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-semibold truncate pt-1 border-t border-neutral-50">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{agent.email}</span>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-md">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block">Workload</span>
                    <span className="text-sm font-extrabold text-neutral-800 mt-1 block">
                      {agent.activeWorkload} / {agent.capacity}
                    </span>
                  </div>
                  <div className="p-2 bg-neutral-50 border border-neutral-100 rounded-md">
                    <span className="text-[9px] uppercase font-bold text-neutral-400 block">Availability</span>
                    <span className={`text-[10px] font-black uppercase mt-1.5 block ${
                      agent.status === 'online' ? 'text-success' : agent.status === 'busy' ? 'text-warning' : 'text-neutral-500'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
