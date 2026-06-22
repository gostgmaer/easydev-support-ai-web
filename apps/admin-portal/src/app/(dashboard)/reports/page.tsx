'use client';

import * as React from 'react';
import { FileText, Mail, Trash2, Plus } from 'lucide-react';
import {
  useAnalyticsReports,
  useCreateAnalyticsReport,
  useDeleteAnalyticsReport,
  useExportAnalyticsReport,
} from '../../../hooks/useAdminQueries';

const REPORT_TYPES = ['Tenant Reports', 'AI Reports', 'Agent Reports', 'Realtime Dashboard'];
const TIME_RANGES = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days'];

export default function ReportsPage() {
  const { data: reports, isLoading, isError } = useAnalyticsReports();
  const createMutation = useCreateAnalyticsReport();
  const deleteMutation = useDeleteAnalyticsReport();
  const exportMutation = useExportAnalyticsReport();

  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [reportType, setReportType] = React.useState(REPORT_TYPES[0]);
  const [timeRange, setTimeRange] = React.useState(TIME_RANGES[1]);
  const [emailedReportId, setEmailedReportId] = React.useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate(
      { name, reportType, timeRange },
      {
        onSuccess: () => {
          setName('');
          setShowForm(false);
        },
      },
    );
  };

  const handleEmail = (reportId: string, format: 'CSV' | 'PDF') => {
    exportMutation.mutate({ reportId, format }, { onSuccess: () => setEmailedReportId(reportId) });
  };

  const handleDelete = (id: string, reportName: string) => {
    if (confirm(`Delete report "${reportName}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="System Reports Catalog">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Analytics Reports</h1>
          <p className="text-xs text-neutral-500">Generate on-demand reports and email the results as a CSV or PDF export.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
        >
          <Plus className="h-4 w-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {emailedReportId && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-xs font-semibold text-success flex items-center justify-between">
          <span>Export queued - it will be emailed to your account shortly.</span>
          <button onClick={() => setEmailedReportId(null)} className="text-neutral-500 hover:text-neutral-700">Dismiss</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="rep-name" className="font-bold text-neutral-600">Report Name</label>
              <input
                id="rep-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Monthly SLA Compliance Audit"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="rep-type" className="font-bold text-neutral-600">Report Type</label>
              <select
                id="rep-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="border border-neutral-200 rounded p-2 bg-white"
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="rep-range" className="font-bold text-neutral-600">Time Range</label>
              <select
                id="rep-range"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-neutral-200 rounded p-2 bg-white"
              >
                {TIME_RANGES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-3.5 py-2 rounded-md disabled:opacity-60"
          >
            {createMutation.isPending ? 'Generating...' : 'Generate Report'}
          </button>
        </form>
      )}

      {/* Reports listing table */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Generated Reports</h2>

        {isLoading && <p className="text-xs text-neutral-400">Loading reports...</p>}
        {isError && <p className="text-xs text-danger-600">Failed to load reports.</p>}

        {reports && (
          reports.length > 0 ? (
            <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
              <table className="w-full text-left divide-y divide-neutral-100">
                <thead className="bg-neutral-50 font-bold text-neutral-500">
                  <tr>
                    <th className="p-3">Report Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Time Range</th>
                    <th className="p-3">Generated</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {reports.map((rep) => (
                    <tr key={rep.id}>
                      <td className="p-3 font-semibold text-neutral-800 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-neutral-400" />
                        <span>{rep.name}</span>
                      </td>
                      <td className="p-3">{rep.reportType}</td>
                      <td className="p-3">{rep.timeRange}</td>
                      <td className="p-3">{new Date(rep.createdAt).toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEmail(rep.id, 'CSV')}
                            disabled={exportMutation.isPending}
                            className="p-1 text-primary-500 hover:text-primary-700 rounded disabled:opacity-40"
                            title="Email CSV export"
                            aria-label={`Email CSV export of ${rep.name}`}
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rep.id, rep.name)}
                            disabled={deleteMutation.isPending}
                            className="p-1 text-neutral-400 hover:text-danger rounded"
                            aria-label={`Delete report ${rep.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic py-8 text-center">No reports generated yet.</p>
          )
        )}
      </div>
    </div>
  );
}
