'use client';

import * as React from 'react';
import {
  useAnalyticsDashboard,
  useAnalyticsAiMetrics,
  useActiveAgentsCount,
  useIncidentsAlerts,
  useQueueStats,
  useSystemHealthChecks,
} from '@/hooks/useAdminQueries';
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
  const { data: metrics, isLoading: isMetricsLoading, isError: isMetricsError } = useAnalyticsDashboard('Last 30 Days');
  const { data: aiMetrics } = useAnalyticsAiMetrics('Last 30 Days');
  const { data: activeAgentsCount } = useActiveAgentsCount();
  const { data: incidents = [], isLoading: isIncidentsLoading, isError: isIncidentsError } = useIncidentsAlerts();
  const { data: queues = [], isLoading: isQueuesLoading, isError: isQueuesError } = useQueueStats();
  const { data: healthChecks = [], isLoading: isHealthChecksLoading, isError: isHealthChecksError } = useSystemHealthChecks();
  const isHealthLoading = isQueuesLoading || isHealthChecksLoading;
  const isHealthError = isQueuesError || isHealthChecksError;

  const getMetricCard = (title: string, value: string | number, desc: string, icon: React.ComponentType<{ className?: string }>, color: string) => {
    const Icon = icon;
    return (
      <div className="bg-white border border-neutral-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-between group">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">{title}</span>
          <span className="text-2xl font-extrabold text-neutral-900 block tracking-tight">{value}</span>
          <span className="text-[10px] text-neutral-500 block leading-none">{desc}</span>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" role="region" aria-label="Admin Dashboard Metrics">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-white to-neutral-50/50 border border-neutral-200/60 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 tracking-tight">Governance Console</h1>
          <p className="text-xs text-neutral-500 mt-1">Real-time platform metrics, connector logs, SLAs, and AI copilot deflection controls.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full">
          <div className="h-2.5 w-2.5 bg-success rounded-full animate-pulse" />
          <span className="text-xs font-bold text-success">System Online</span>
        </div>
      </div>

      {/* Primary KPIs grid */}
      {isMetricsLoading ? (
        <div className="text-center text-xs text-neutral-400 py-12 animate-pulse font-semibold">
          Loading platform metrics...
        </div>
      ) : isMetricsError ? (
        <div className="text-center text-xs text-danger py-12 font-semibold">
          Couldn&apos;t load platform metrics. Please try again later.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getMetricCard(
            'Active Conversations',
            metrics?.conversationsCount ?? 0,
            'Conversations in the last 30 days',
            MessageSquare,
            'text-primary-500 bg-primary-50'
          )}
          {getMetricCard(
            'SLA Compliance',
            `${metrics ? (100 - metrics.slaViolationRate).toFixed(1) : '0.0'}%`,
            'Response threshold targets',
            Clock,
            'text-success bg-success/15'
          )}
          {getMetricCard(
            'AI Deflection Rate',
            `${aiMetrics ? aiMetrics.aiResolutionRate.toFixed(1) : '0.0'}%`,
            'Self-resolved by copilot agent',
            Sparkles,
            'text-cyan-600 bg-cyan-50'
          )}
          {getMetricCard(
            'Active Agents',
            activeAgentsCount ?? 0,
            'Agents enabled on this tenant',
            Bot,
            'text-info bg-info/15'
          )}
        </div>
      )}

      {/* Grid: Incidents & Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents Alert Box */}
        <div className="lg:col-span-2 bg-white border border-neutral-200/60 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <AlertTriangle className="h-4.5 w-4.5" />
            <span>Active Incident Alarms</span>
          </h2>

          {isIncidentsLoading ? (
            <div className="py-6 text-center text-xs text-neutral-400 animate-pulse font-semibold">
              Loading active incident log...
            </div>
          ) : isIncidentsError ? (
            <p className="text-xs text-danger font-semibold py-6 text-center">
              Couldn&apos;t load the incident log - status unknown, not necessarily clear.
            </p>
          ) : incidents.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex justify-between items-center py-3 hover:bg-neutral-50/50 transition-colors rounded-lg px-2 -mx-2">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-neutral-900 block">{incident.title}</span>
                    <span className="text-[10px] text-neutral-400 block">Reported: {new Date(incident.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                    incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'bg-danger/10 border border-danger/25 text-danger shadow-sm' : 'bg-warning/10 border border-warning/25 text-warning shadow-sm'
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
        <div className="bg-white border border-neutral-200/60 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <Server className="h-4.5 w-4.5" />
            <span>Operational Worker Nodes</span>
          </h2>

          <div className="space-y-3.5 text-xs text-neutral-600">
            {isHealthLoading ? (
              <p className="text-neutral-400 italic py-2">Loading health checks...</p>
            ) : isHealthError ? (
              <p className="text-danger font-semibold py-2">
                Couldn&apos;t load health checks - status unknown, not necessarily healthy.
              </p>
            ) : (
              <>
                {(() => {
                  const totalBacklogged = queues.reduce((sum, q) => sum + q.waiting + q.failed, 0);
                  return (
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <span className="font-medium">BullMQ Queue Status</span>
                      <span className={`px-2 py-0.5 rounded-lg font-semibold ${
                        totalBacklogged === 0 ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'
                      }`}>
                        {totalBacklogged === 0 ? 'Healthy' : `${totalBacklogged} backlogged`}
                      </span>
                    </div>
                  );
                })()}
                {healthChecks.map((check) => (
                  <div key={check.id} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                    <span className="capitalize font-medium">{check.serviceName.replace(/-/g, ' ')}</span>
                    <span className={`px-2 py-0.5 rounded-lg font-semibold ${
                      check.status === 'HEALTHY' ? 'bg-success/10 text-success border border-success/20' : check.status === 'DEGRADED' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-danger/10 text-danger border border-danger/20'
                    }`}>
                      {check.status} • {check.latencyMs}ms
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
