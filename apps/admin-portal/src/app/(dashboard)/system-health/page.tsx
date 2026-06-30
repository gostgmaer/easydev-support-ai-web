'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Activity, AlertTriangle, Server, Cpu, RefreshCw, SkipForward } from 'lucide-react';
import {
  useIncidentsAlerts,
  useResolveIncident,
  useQueueStats,
  useSystemHealthChecks,
  useAuditLog,
  useHardeningCost,
  useReplayOutbox,
  useQueueFailedJobs,
  useRetryQueueJob,
  useDeadLetterQueue,
  useReplayDeadLetterJob,
} from '@/hooks/useAdminQueries';

export default function SystemHealthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: incidents = [], isLoading } = useIncidentsAlerts();
  const resolveMutation = useResolveIncident();
  const { data: queues = [], isLoading: isQueuesLoading } = useQueueStats();
  const { data: healthChecks = [], isLoading: isHealthLoading } = useSystemHealthChecks();
  const { data: auditResult, isLoading: isAuditLoading } = useAuditLog();
  const auditLogs = auditResult?.data ?? [];

  const [activeTab, setActiveTab] = React.useState<'health' | 'queues' | 'audit' | 'incidents' | 'hardening'>('health');

  React.useEffect(() => {
    if (pathname.includes('/audit')) {
      setActiveTab('audit');
    } else if (pathname.includes('/incidents')) {
      setActiveTab('incidents');
    } else if (pathname.includes('/hardening')) {
      setActiveTab('hardening');
    } else if (pathname.includes('/queues')) {
      setActiveTab('queues');
    } else {
      setActiveTab('health');
    }
  }, [pathname]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'health') {
      router.push('/system-health');
    } else {
      router.push(`/system-health/${tab}`);
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="Operations Center Panel">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Operations & Audit Logs</h1>
          <p className="text-xs text-neutral-500">Monitor queue backlogs, check worker health parameters, and audit security events logs.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-neutral-100 p-1 rounded-md text-xs font-bold self-start md:self-center gap-1">
          {(['health', 'queues', 'audit', 'incidents', 'hardening'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md capitalize transition ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab === 'health' ? 'System Health' : tab === 'queues' ? 'Queues' : tab === 'audit' ? 'Audit Logs' : tab === 'incidents' ? 'Incidents' : 'Hardening'}
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

            {isQueuesLoading || isHealthLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading health checks...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {healthChecks.map((check) => (
                  <div key={check.id} className="p-4 border border-neutral-200 rounded-lg space-y-2 text-xs">
                    <span className="font-bold text-neutral-800 flex items-center gap-1 capitalize">
                      <Server className="h-4 w-4 text-primary-500" />
                      <span>{check.serviceName.replace(/-/g, ' ')}</span>
                    </span>
                    <span className={`text-lg font-extrabold block ${
                      check.status === 'HEALTHY' ? 'text-success' : check.status === 'DEGRADED' ? 'text-warning' : 'text-danger'
                    }`}>
                      {check.status}
                    </span>
                    <span className="text-[10px] text-neutral-500">Latency: {check.latencyMs}ms • Errors: {(check.errorRate * 100).toFixed(1)}%</span>
                  </div>
                ))}
                {queues.map((q) => (
                  <div key={q.name} className="p-4 border border-neutral-200 rounded-lg space-y-2 text-xs">
                    <span className="font-bold text-neutral-800 flex items-center gap-1 capitalize">
                      <Cpu className="h-4 w-4 text-cyan-500" />
                      <span>{q.name.replace(/-/g, ' ')} Queue</span>
                    </span>
                    <span className={`text-lg font-extrabold block ${q.failed === 0 ? 'text-success' : 'text-danger'}`}>
                      {q.active} active
                    </span>
                    <span className="text-[10px] text-neutral-500">Waiting: {q.waiting} • Failed: {q.failed} • {q.paused ? 'Paused' : 'Running'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Entity Change Audit Log</h2>

            {isAuditLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading audit log...</p>
            ) : auditLogs.length > 0 ? (
              <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
                <table className="w-full text-left divide-y divide-neutral-100">
                  <thead className="bg-neutral-50 font-bold text-neutral-500">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="p-3 font-semibold text-neutral-800">{log.userId || 'System'}</td>
                        <td className="p-3">{log.action}{log.details ? ` — ${log.details}` : ''}</td>
                        <td className="p-3 font-mono text-neutral-500">{log.ipAddress || '—'}</td>
                        <td className="p-3 text-right font-semibold text-neutral-500">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic py-8 text-center">No audit events recorded yet.</p>
            )}
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
                      <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                        <AlertTriangle className="h-4.5 w-4.5 text-danger" />
                        <span>{incident.title}</span>
                      </span>
                      <span className="text-[10px] text-neutral-400 block">Reported: {new Date(incident.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'text-danger bg-danger/15' : 'text-warning bg-warning/15'
                      }`}>
                        {incident.severity}
                      </span>
                      {incident.status !== 'RESOLVED' && (
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
        {/* 4. QUEUES TAB */}
        {activeTab === 'queues' && (
          <QueuesTab queues={queues} />
        )}

        {/* 5. HARDENING TAB */}
        {activeTab === 'hardening' && (
          <HardeningTab />
        )}
      </div>
    </div>
  );
}

function QueuesTab({ queues }: { queues: { name: string; active: number; waiting: number; failed: number; paused: boolean }[] }) {
  const [selectedQueue, setSelectedQueue] = React.useState<string | null>(null);
  const { data: failedJobs = [], isLoading: isFailedLoading } = useQueueFailedJobs(selectedQueue ?? undefined);
  const retryMutation = useRetryQueueJob();
  const { data: deadLetterJobs = [], isLoading: isDeadLoading } = useDeadLetterQueue();
  const replayMutation = useReplayDeadLetterJob();

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
          <Cpu className="h-4 w-4 text-cyan-500" />
          <span>Queue Status Overview</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {queues.map((q) => (
            <button
              key={q.name}
              onClick={() => setSelectedQueue(selectedQueue === q.name ? null : q.name)}
              className={`p-4 rounded-lg border text-left transition ${
                selectedQueue === q.name
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <span className="font-bold text-neutral-700 block capitalize mb-1">{q.name.replace(/-/g, ' ')}</span>
              <div className="flex gap-3 text-[10px]">
                <span className="text-neutral-500">Active: <b className="text-neutral-800">{q.active}</b></span>
                <span className="text-neutral-500">Wait: <b className="text-neutral-800">{q.waiting}</b></span>
                {q.failed > 0 && <span className="text-danger font-bold">Failed: {q.failed}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedQueue && (
        <div className="space-y-3">
          <h3 className="font-bold text-neutral-700 capitalize">{selectedQueue.replace(/-/g, ' ')} — Failed Jobs</h3>
          {isFailedLoading ? (
            <p className="text-neutral-400 animate-pulse">Loading failed jobs...</p>
          ) : failedJobs.length === 0 ? (
            <p className="text-neutral-400 italic py-4 text-center">No failed jobs in this queue.</p>
          ) : (
            <div className="overflow-x-auto border border-neutral-100 rounded-lg">
              <table className="w-full text-left divide-y divide-neutral-100 text-xs">
                <thead className="bg-neutral-50 font-bold text-neutral-500">
                  <tr>
                    <th className="p-3">Job Name</th>
                    <th className="p-3">Failure Reason</th>
                    <th className="p-3">Failed At</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {failedJobs.map((job) => (
                    <tr key={job.id}>
                      <td className="p-3 font-semibold text-neutral-800 font-mono">{job.name}</td>
                      <td className="p-3 text-danger max-w-xs truncate" title={job.failedReason}>{job.failedReason}</td>
                      <td className="p-3 text-neutral-500">{new Date(job.timestamp).toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => retryMutation.mutate({ queueName: selectedQueue, jobId: job.id })}
                          disabled={retryMutation.isPending}
                          className="flex items-center gap-1 ml-auto rounded border border-primary-200 bg-primary-50 px-2 py-1 text-[10px] font-bold text-primary-600 hover:bg-primary-100 disabled:opacity-50"
                        >
                          <RefreshCw className="h-3 w-3" /> Retry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 border-t border-neutral-100 pt-4">
        <h3 className="font-bold text-neutral-700 flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-danger" />
          Dead-Letter Queue
        </h3>
        {isDeadLoading ? (
          <p className="text-neutral-400 animate-pulse">Loading dead-letter jobs...</p>
        ) : deadLetterJobs.length === 0 ? (
          <p className="text-neutral-400 italic py-4 text-center">Dead-letter queue is empty.</p>
        ) : (
          <div className="overflow-x-auto border border-neutral-100 rounded-lg">
            <table className="w-full text-left divide-y divide-neutral-100 text-xs">
              <thead className="bg-neutral-50 font-bold text-neutral-500">
                <tr>
                  <th className="p-3">Queue</th>
                  <th className="p-3">Job Name</th>
                  <th className="p-3">Attempts</th>
                  <th className="p-3">Failure Reason</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {deadLetterJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="p-3 font-mono text-neutral-500">{job.queue}</td>
                    <td className="p-3 font-semibold text-neutral-800 font-mono">{job.name}</td>
                    <td className="p-3 text-danger font-bold">{job.attemptsMade}</td>
                    <td className="p-3 text-danger max-w-xs truncate" title={job.failedReason}>{job.failedReason}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => replayMutation.mutate(job.id)}
                        disabled={replayMutation.isPending}
                        className="flex items-center gap-1 ml-auto rounded border border-warning/30 bg-warning/10 px-2 py-1 text-[10px] font-bold text-warning hover:bg-warning/20 disabled:opacity-50"
                      >
                        <SkipForward className="h-3 w-3" /> Replay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function HardeningTab() {
  const { data: costData, isLoading } = useHardeningCost();
  const replayMutation = useReplayOutbox();

  return (
    <div className="space-y-6 text-xs">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Security & Anti-Abuse (Hardening)</h2>
      
      {isLoading ? (
        <p className="text-neutral-400 animate-pulse">Loading hardening costs...</p>
      ) : costData ? (
        <div className="space-y-4 max-w-xl">
          <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 flex justify-between items-center">
            <div>
              <span className="font-bold text-neutral-800 block">Total Mitigation Cost</span>
              <span className="text-neutral-500 mt-0.5 block">Estimated USD spent on anti-abuse and bot-mitigation API calls.</span>
            </div>
            <span className="text-lg font-extrabold text-danger">${costData.totalCostUsd.toFixed(2)}</span>
          </div>

          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <div className="bg-neutral-100 p-3 font-semibold text-neutral-700">Cost Breakdown</div>
            <div className="divide-y divide-neutral-100">
              {Object.entries(costData.breakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-white">
                  <span className="text-neutral-600 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-neutral-800">${value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-neutral-400">Failed to load hardening costs.</p>
      )}

      <div className="pt-6 border-t border-neutral-100 max-w-xl">
        <h3 className="font-bold text-neutral-800 mb-2">Outbox Recovery</h3>
        <p className="text-neutral-500 mb-4">
          If message delivery events are stuck in the transactional outbox due to a message broker failure, you can trigger a manual replay.
        </p>
        <button
          onClick={() => replayMutation.mutate()}
          disabled={replayMutation.isPending}
          className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {replayMutation.isPending ? 'Replaying...' : 'Replay Stuck Outbox Events'}
        </button>
        {replayMutation.isSuccess && (
          <p className="text-success mt-2 font-semibold">Successfully replayed {replayMutation.data.replayed} events.</p>
        )}
      </div>
    </div>
  );
}
