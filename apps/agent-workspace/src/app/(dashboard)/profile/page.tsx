'use client';

import React from 'react';
import { User, Shield, Clock, BarChart3, CheckSquare, Award } from 'lucide-react';

export default function ProfilePage() {
  // Static robust KPIs aligned to senior agent operations
  const stats = [
    { label: 'SLA Compliance Rate', value: '98.4%', icon: Award, color: 'text-success bg-success/15' },
    { label: 'Resolved Tickets (Mo.)', value: '412', icon: CheckSquare, color: 'text-primary-500 bg-primary-50' },
    { label: 'Avg. First Response Time', value: '8m 42s', icon: Clock, color: 'text-info bg-info/15' },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-50 p-6 space-y-6 overflow-y-auto" role="region" aria-label="Profile settings page">
      {/* Profile Header card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-neutral-200 border-2 border-neutral-300 flex items-center justify-center font-bold text-xl text-neutral-700">
            JD
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 leading-tight">John Doe</h1>
            <p className="text-xs text-neutral-500 block mt-1">Role: Senior Support Specialist</p>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded mt-1.5 border border-primary-100">
              <Shield className="h-3 w-3" /> Tier 2 Authorization
            </span>
          </div>
        </div>

        <div className="text-xs text-neutral-500 border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6 space-y-1.5">
          <span className="font-semibold text-neutral-400 uppercase tracking-wider block text-[10px]">Shift Hours</span>
          <span className="font-bold text-neutral-800 block">Morning Shift (8:00 AM - 5:00 PM EST)</span>
          <span className="block">Timezone: UTC-5 (America/New_York)</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">{stat.label}</span>
                <span className="text-xl font-extrabold text-neutral-900 mt-2 block">{stat.value}</span>
              </div>
              <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${stat.color}`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Logs details */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <BarChart3 className="h-4.5 w-4.5" />
          <span>Active Session Metrics</span>
        </h2>

        <div className="space-y-3.5 text-xs text-neutral-600">
          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <span>Authentication Token Status</span>
            <span className="text-success font-semibold">Valid (Expires in 6 hours)</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <span>WebSocket Latency</span>
            <span className="text-neutral-900 font-bold">14 ms</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <span>IP Address</span>
            <span className="text-neutral-900 font-semibold">192.168.1.152</span>
          </div>
        </div>
      </div>
    </div>
  );
}
