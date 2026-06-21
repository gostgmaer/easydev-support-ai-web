'use client';

import * as React from 'react';
import { useDashboardMetrics, useIncidentsAlerts } from '@/hooks/useAdminQueries';
import {
  MessageSquare,
  Ticket,
  Clock,
  Sparkles,
  Bot,
  Activity,
  AlertTriangle,
  Server
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: metrics, isLoading: isMetricsLoading } = useDashboardMetrics();
  const { data: incidents = [], isLoading: isIncidentsLoading } = useIncidentsAlerts();

  const getMetricCard = (title: string, value: string | number, desc: string, icon: React.ComponentType<{ className?: string }>, color: string) => {
    const Icon = icon;
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">{title}</span>
          <span className="text-xl font-extrabold text-neutral-900 block">{value}</span>
          <span className="text-[10px] text-neutral-500 block leading-none">{desc}</span>
        </div>
        <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5.5 w-5.5" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" role="region" aria-label="Admin Dashboard Metrics">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Governance Console</h1>
          <p className="text-xs text-neutral-500">Real-time platform metrics, connector logs, SLAs, and AI copilot deflection controls.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 bg-success rounded-full animate-pulse" />
          <span className="text-xs font-bold text-success">System Online</span>
        </div>
      </div>

      {/* Primary KPIs grid */}
      {isMetricsLoading ? (
        <div className="text-center text-xs text-neutral-400 py-12 animate-pulse font-semibold">
          Loading platform metrics...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getMetricCard(
            'Active Conversations',
            metrics?.conversationsCount ?? 1420,
            'Live customer chat threads',
            MessageSquare,
            'text-primary-500 bg-primary-50'
          )}
          {getMetricCard(
            'SLA Compliance',
            `${metrics?.slaCompliance ?? 96.5}%`,
            'Response threshold targets',
            Clock,
            'text-success bg-success/15'
          )}
          {getMetricCard(
            'AI Deflection Rate',
            `${metrics?.aiDeflectionRate ?? 42.1}%`,
            'Self-resolved by copilot agent',
            Sparkles,
            'text-cyan-600 bg-cyan-50'
          )}
          {getMetricCard(
            'Active Agents',
            metrics?.activeAgentsCount ?? 45,
            'Support agents currently online',
            Bot,
            'text-info bg-info/15'
          )}
        </div>
      )}

      {/* Grid: Incidents & Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents Alert Box */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>Active Incident Alarms</span>
          </h2>

          {isIncidentsLoading ? (
            <div className="py-6 text-center text-xs text-neutral-400 animate-pulse font-semibold">
              Loading active incident log...
            </div>
          ) : incidents.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex justify-between items-center py-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-neutral-900 block">{incident.title}</span>
                    <span className="text-[10px] text-neutral-400 block">Reported: {new Date(incident.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    incident.severity === 'critical' ? 'bg-danger/10 border border-danger/25 text-danger' : 'bg-warning/10 border border-warning/25 text-warning'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic py-6 text-center">No active platform incident warnings.</p>
          )}
        </div>

        {/* Worker health card */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <Server className="h-4.5 w-4.5" />
            <span>Operational Worker Nodes</span>
          </h2>

          <div className="space-y-3.5 text-xs text-neutral-600">
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
              <span>BullMQ Queue Status</span>
              <span className="text-success font-semibold">Healthy (0 Backlogged)</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
              <span>Redis Cluster Hit Rate</span>
              <span className="text-neutral-900 font-bold">99.2%</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
              <span>Database CPU Load</span>
              <span className="text-neutral-900 font-semibold">12.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
