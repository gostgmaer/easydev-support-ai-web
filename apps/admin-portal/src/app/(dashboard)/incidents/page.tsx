'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2, Plus, RefreshCw } from 'lucide-react';
import {
  useIncidentsAlerts,
  useCreateIncident,
  useUpdateIncidentStatus,
  useResolveIncident,
  useIncidentById,
} from '../../../hooks/useAdminQueries';
import type { IncidentAlert } from '../../../store/adminStore';

const SEVERITY_STYLES: Record<IncidentAlert['severity'], string> = {
  LOW: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  MEDIUM: 'bg-warning/10 text-warning border-warning/20',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICAL: 'bg-danger/10 text-danger border-danger/20 font-black animate-pulse',
};

const STATUS_STYLES: Record<IncidentAlert['status'], string> = {
  OPEN: 'bg-danger/10 text-danger',
  INVESTIGATING: 'bg-warning/10 text-warning',
  MONITORING: 'bg-blue-50 text-blue-700',
  RESOLVED: 'bg-success/10 text-success',
};

const STATUS_OPTIONS: IncidentAlert['status'][] = ['OPEN', 'INVESTIGATING', 'MONITORING', 'RESOLVED'];

function IncidentDetailRow({ id }: { id: string }) {
  const { data: incident, isLoading } = useIncidentById(id);
  if (isLoading) return <tr><td colSpan={5} className="px-4 py-2 text-[10px] text-neutral-400 animate-pulse">Loading detail…</td></tr>;
  if (!incident) return null;
  return (
    <tr className="bg-neutral-50">
      <td colSpan={5} className="px-5 py-3 text-xs text-neutral-700 space-y-1.5">
        {incident.description && (
          <div><span className="font-semibold text-neutral-500 uppercase text-[10px]">Description: </span>{incident.description}</div>
        )}
        {incident.affectedService && (
          <div><span className="font-semibold text-neutral-500 uppercase text-[10px]">Affected Service: </span><span className="font-mono">{incident.affectedService}</span></div>
        )}
        <div><span className="font-semibold text-neutral-500 uppercase text-[10px]">Incident ID: </span><span className="font-mono text-[10px]">{incident.id}</span></div>
      </td>
    </tr>
  );
}

export default function IncidentsPage() {
  const { data: incidents = [], isLoading, isError, refetch } = useIncidentsAlerts();
  const createMutation = useCreateIncident();
  const updateStatusMutation = useUpdateIncidentStatus();
  const resolveMutation = useResolveIncident();

  const [showForm, setShowForm] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [severity, setSeverity] = React.useState<IncidentAlert['severity']>('MEDIUM');
  const [description, setDescription] = React.useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate(
      { title: title.trim(), severity, description: description.trim() || undefined },
      {
        onSuccess: () => {
          setTitle('');
          setSeverity('MEDIUM');
          setDescription('');
          setShowForm(false);
        },
      },
    );
  };

  const openCount = incidents.filter((i) => i.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6" role="region" aria-label="Incident Management">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            Incident Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track and manage operational incidents.{' '}
            {openCount > 0 && (
              <span className="font-bold text-danger">{openCount} open incident{openCount !== 1 ? 's' : ''}.</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-neutral-400 hover:text-neutral-700 border border-neutral-200 rounded-md hover:bg-neutral-50 transition"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
          >
            <Plus className="h-4 w-4" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-3 text-xs">
          <h2 className="text-xs font-bold text-neutral-700">New Incident</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 flex flex-col gap-1">
              <label htmlFor="inc-title" className="font-semibold text-neutral-600">Title</label>
              <input
                id="inc-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. API latency spike on /v1/inbox"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="inc-severity" className="font-semibold text-neutral-600">Severity</label>
              <select
                id="inc-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentAlert['severity'])}
                className="border border-neutral-200 rounded p-2 bg-white"
              >
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="inc-desc" className="font-semibold text-neutral-600">Description (optional)</label>
            <textarea
              id="inc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of the incident…"
              className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending || !title.trim()}
              className="bg-danger hover:bg-danger/90 text-white font-bold px-3.5 py-2 rounded-md disabled:opacity-60 transition"
            >
              {createMutation.isPending ? 'Reporting…' : 'Report Incident'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-neutral-500 px-3 py-2 hover:text-neutral-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Incidents Table */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        {isLoading && <p className="p-6 text-xs text-neutral-400">Loading incidents…</p>}
        {isError && <p className="p-6 text-xs text-danger">Failed to load incidents. <button onClick={() => refetch()} className="underline">Retry</button></p>}

        {!isLoading && !isError && incidents.length === 0 && (
          <div className="p-10 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
            <p className="text-sm font-bold text-neutral-700">All systems operational</p>
            <p className="text-xs text-neutral-400">No active incidents reported.</p>
          </div>
        )}

        {incidents.length > 0 && (
          <table className="w-full text-left text-xs text-neutral-700 divide-y divide-neutral-100">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Incident</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reported</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {incidents.map((incident) => (
                <React.Fragment key={incident.id}>
                <tr
                  className="hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId((cur) => cur === incident.id ? null : incident.id)}
                >
                  <td className="px-4 py-3 font-semibold text-neutral-800">{incident.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${SEVERITY_STYLES[incident.severity]}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={incident.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          id: incident.id,
                          status: e.target.value as IncidentAlert['status'],
                        })
                      }
                      disabled={incident.status === 'RESOLVED' || updateStatusMutation.isPending}
                      className={`rounded border-0 text-[10px] font-bold uppercase px-2 py-1 cursor-pointer focus:ring-1 focus:ring-primary-500 ${STATUS_STYLES[incident.status]} disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 tabular-nums">
                    {new Date(incident.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {incident.status !== 'RESOLVED' && (
                      <button
                        onClick={() => resolveMutation.mutate({ id: incident.id })}
                        disabled={resolveMutation.isPending}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-success border border-success/30 rounded px-2 py-1 hover:bg-success/10 disabled:opacity-50 transition"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Resolve
                      </button>
                    )}
                    {incident.status === 'RESOLVED' && (
                      <span className="text-[10px] text-neutral-400 font-semibold">Resolved</span>
                    )}
                  </td>
                </tr>
                {expandedId === incident.id && <IncidentDetailRow id={incident.id} />}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
