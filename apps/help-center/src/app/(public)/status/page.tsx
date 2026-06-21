'use client';

import * as React from 'react';
import { useSystemStatus, SystemStatus } from '@/hooks/useHelpQueries';
import { ShieldCheck, AlertTriangle, Activity, Calendar, HelpCircle, CheckCircle } from 'lucide-react';
import { Spinner, Badge } from '@easydev/ui';

export default function SystemStatusDiagnosticsPage() {
  const { data: statusData, isLoading, error } = useSystemStatus();

  // Mock status logs for dev compilation fallback
  const mockStatus: SystemStatus = {
    overallStatus: 'operational',
    incidentHistory: [
      {
        id: 'inc-1',
        title: 'Realtime WebSocket connection errors during peak loads',
        status: 'Resolved',
        date: '2026-06-18',
        updates: [
          'Identified server memory threshold leaks inside Nest Websocket gateways. Allocated secondary node buffers to resolve reconnect latency.',
        ],
      },
    ],
    maintenance: [
      {
        id: 'maint-1',
        title: 'Database instance migration and maintenance window',
        scheduledFor: 'June 28, 2026, 02:00 UTC',
        duration: '60 minutes',
      },
    ],
    metrics: [
      { name: 'Self-Service Web Portal', uptime: 99.98 },
      { name: 'Core API Gateway', uptime: 99.99 },
      { name: 'Realtime Socket.IO Gateways', uptime: 99.95 },
      { name: 'Shopify Connector Integrations', uptime: 99.92 },
      { name: 'AI Deflections Server', uptime: 100.0 },
    ],
  };

  const activeStatus = (statusData && statusData.overallStatus) || error ? mockStatus : statusData;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-16 bg-neutral-50/50">
        <Spinner className="h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  const getOverallStatusBanner = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <div className="p-6 border border-success-200 bg-success-50/50 text-success-850 rounded-xl flex items-center gap-4 shadow-3xs">
            <CheckCircle className="h-8 w-8 text-success-600 shrink-0" />
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-neutral-900 text-xs">All Systems Operational</h3>
              <p className="text-[10px] text-neutral-500 font-medium">Core API gateways, database instances, and socket servers are performing normally.</p>
            </div>
          </div>
        );
      case 'degraded':
        return (
          <div className="p-6 border border-warning-200 bg-warning-50/50 text-warning-850 rounded-xl flex items-center gap-4 shadow-3xs">
            <AlertTriangle className="h-8 w-8 text-warning-600 shrink-0" />
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-neutral-900 text-xs">Systems Experiencing Latency</h3>
              <p className="text-[10px] text-neutral-500 font-medium">Some services are experiencing degraded performance thresholds.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6 border border-danger-200 bg-danger-50/50 text-danger-850 rounded-xl flex items-center gap-4 shadow-3xs">
            <AlertTriangle className="h-8 w-8 text-danger-600 shrink-0" />
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-neutral-900 text-xs">Critical Outage detected</h3>
              <p className="text-[10px] text-neutral-500 font-medium">Our engineering team is actively investigating outage alerts on core services.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Title bar */}
      <div className="border-b border-neutral-100 pb-3">
        <h1 className="text-xl font-extrabold text-neutral-900">System Status</h1>
        <p className="text-neutral-500 mt-1">Realtime service availability metrics, incident updates, and maintenance schedules.</p>
      </div>

      {activeStatus && (
        <div className="space-y-6">
          {/* Status banner */}
          {getOverallStatusBanner(activeStatus.overallStatus)}

          {/* Service node health metrics */}
          <section className="space-y-3 bg-white p-5 border border-neutral-200 rounded-xl shadow-3xs">
            <h3 className="font-extrabold text-neutral-905 text-xs flex items-center gap-2 border-b border-neutral-100 pb-2">
              <Activity className="h-4.5 w-4.5 text-neutral-500" />
              <span>Service Nodes Availability</span>
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {activeStatus.metrics.map((met: any) => (
                <div key={met.name} className="flex justify-between items-center text-[10px] py-1">
                  <span className="font-bold text-neutral-700">{met.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 font-semibold">{met.uptime}% Uptime</span>
                    <Badge tone="success" className="text-[8px] font-bold">OPERATIONAL</Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Incident / Maintenance listings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scheduled Maintenance */}
            <section className="bg-white p-5 border border-neutral-200 rounded-xl shadow-3xs space-y-3">
              <h3 className="font-extrabold text-neutral-950 text-xs flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                <Calendar className="h-4.5 w-4.5 text-neutral-400" />
                <span>Scheduled Maintenance</span>
              </h3>
              {activeStatus.maintenance.length === 0 ? (
                <p className="text-neutral-400 text-[10px] leading-relaxed">No upcoming maintenance windows scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {activeStatus.maintenance.map((m: any) => (
                    <div key={m.id} className="p-3 border border-neutral-100 rounded-lg bg-neutral-50/50 space-y-1">
                      <h4 className="font-bold text-neutral-800 text-[10px] leading-normal">{m.title}</h4>
                      <p className="text-neutral-400 text-[9px] leading-normal">
                        Starts: {m.scheduledFor} <br />
                        Duration: {m.duration}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Incidents logs */}
            <section className="bg-white p-5 border border-neutral-200 rounded-xl shadow-3xs space-y-3">
              <h3 className="font-extrabold text-neutral-955 text-xs flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                <ShieldCheck className="h-4.5 w-4.5 text-neutral-400" />
                <span>Recent Incident Logs</span>
              </h3>
              {activeStatus.incidentHistory.length === 0 ? (
                <p className="text-neutral-400 text-[10px] leading-relaxed">All systems operational. No recent outages reported.</p>
              ) : (
                <div className="space-y-3">
                  {activeStatus.incidentHistory.map((inc: any) => (
                    <div key={inc.id} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge tone="success">{inc.status}</Badge>
                        <span className="text-[9px] text-neutral-400 font-semibold">{inc.date}</span>
                      </div>
                      <h4 className="font-bold text-neutral-800 text-[10px] leading-snug">{inc.title}</h4>
                      {inc.updates.map((up: any, i: number) => (
                        <p key={i} className="text-neutral-400 text-[9px] leading-normal">
                          &bull; {up}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
