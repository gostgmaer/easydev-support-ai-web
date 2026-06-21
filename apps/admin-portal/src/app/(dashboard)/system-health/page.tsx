'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Activity, ShieldCheck, AlertTriangle, RefreshCw, Server, Cpu } from 'lucide-react';
import { useIncidentsAlerts, useResolveIncident } from '@/hooks/useAdminQueries';

interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  ipAddress: string;
  timestamp: string;
}

export default function SystemHealthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: incidents = [], isLoading } = useIncidentsAlerts();
  const resolveMutation = useResolveIncident();

  const [activeTab, setActiveTab] = React.useState<'health' | 'audit' | 'incidents'>('health');

  React.useEffect(() => {
    if (pathname.includes('/audit')) {
      setActiveTab('audit');
    } else if (pathname.includes('/incidents')) {
      setActiveTab('incidents');
    } else {
      setActiveTab('health');
    }
  }, [pathname]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'health') {
      router.push('/system-health');
    } else {
      router.push(`/${tab}`);
    }
  };

  const auditLogs: AuditLogItem[] = [
    { id: 'aud-1', actor: 'John Doe (Admin)', action: 'Generated API Key: CRM Sync Pipeline', ipAddress: '192.168.1.152', timestamp: '2026-06-21 12:14:02' },
    { id: 'aud-2', actor: 'System Auto-Governor', action: 'Triggered SLA Alert: NCT-98', ipAddress: '127.0.0.1', timestamp: '2026-06-21 11:45:00' },
    { id: 'aud-3', actor: 'Jane Smith (Manager)', action: 'Modified Team Member: John Doe', ipAddress: '192.168.1.180', timestamp: '2026-06-20 09:30:15' },
  ];

  return (
    <div className="space-y-6" role="region" aria-label="Operations Center Panel">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Operations & Audit Logs</h1>
          <p className="text-xs text-neutral-500">Monitor queue backlogs, check worker health parameters, and audit security events logs.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-md text-xs font-bold self-start md:self-center gap-1">
          {(['health', 'audit', 'incidents'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md capitalize transition ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab === 'health' ? 'System Health' : tab === 'audit' ? 'Audit Logs' : 'Incidents'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs content viewport */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs min-h-[300px]">
        {/* 1. HEALTH TAB */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Platform Performance Stats</h2>
            
            {/* Health parameters grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-neutral-200 rounded-lg space-y-2 text-xs">
                <span className="font-bold text-neutral-800 flex items-center gap-1">
                  <Server className="h-4 w-4 text-primary-500" />
                  <span>Postgres Database Load</span>
                </span>
                <span className="text-lg font-extrabold text-neutral-900 block">12.4%</span>
                <span className="text-[10px] text-neutral-500">Connections: 42 active</span>
              </div>

              <div className="p-4 border border-neutral-200 rounded-lg space-y-2 text-xs">
                <span className="font-bold text-neutral-800 flex items-center gap-1">
                  <Cpu className="h-4 w-4 text-cyan-500" />
                  <span>Redis Memory Utilization</span>
                </span>
                <span className="text-lg font-extrabold text-neutral-900 block">34.2 MB / 512 MB</span>
                <span className="text-[10px] text-neutral-500">Eviction Rate: 0.0%</span>
              </div>

              <div className="p-4 border border-neutral-200 rounded-lg space-y-2 text-xs">
                <span className="font-bold text-neutral-800 flex items-center gap-1">
                  <Activity className="h-4 w-4 text-success" />
                  <span>BullMQ Active Workers</span>
                </span>
                <span className="text-lg font-extrabold text-neutral-900 block">6 / 6 online</span>
                <span className="text-[10px] text-neutral-500">Backlogged jobs: 0</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Security Access & Modification Logs</h2>
            
            <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
              <table className="w-full text-left divide-y divide-neutral-100">
                <thead className="bg-neutral-50 font-bold text-neutral-500">
                  <tr>
                    <th className="p-3">Actor / Agent</th>
                    <th className="p-3">Action Description</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-3 font-semibold text-neutral-800">{log.actor}</td>
                      <td className="p-3">{log.action}</td>
                      <td className="p-3 font-mono text-neutral-500">{log.ipAddress}</td>
                      <td className="p-3 text-right font-semibold text-neutral-500">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. INCIDENTS TAB */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Platform Incident alerts</h2>
            
            {isLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading incidents...</p>
            ) : incidents.length > 0 ? (
              <div className="divide-y divide-neutral-100 text-xs">
                {incidents.map((incident) => (
                  <div key={incident.id} className="flex justify-between items-center py-3.5 hover:bg-neutral-50 px-2 rounded transition-all">
                    <div className="space-y-1">
                      <span className="font-bold text-neutral-800 block flex items-center gap-1.5">
                        <AlertTriangle className="h-4.5 w-4.5 text-danger" />
                        <span>{incident.title}</span>
                      </span>
                      <span className="text-[10px] text-neutral-400 block">Reported: {new Date(incident.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        incident.severity === 'critical' ? 'text-danger bg-danger/15' : 'text-warning bg-warning/15'
                      }`}>
                        {incident.severity}
                      </span>
                      {incident.status !== 'resolved' && (
                        <button
                          onClick={() => resolveMutation.mutate({ id: incident.id })}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-[10px] rounded transition"
                        >
                          Resolve Alert
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic py-8 text-center">No platform incidents recorded. System running stable.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
