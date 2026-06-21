'use client';

import * as React from 'react';
import { FileText, Download, Clock, Star, Calendar } from 'lucide-react';

interface SupportReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastRun: string;
  format: 'PDF' | 'CSV';
}

export default function ReportsPage() {
  const [reports, setReports] = React.useState<SupportReport[]>([
    { id: 'rep-1', name: 'Monthly SLA Compliance Audit', frequency: 'monthly', lastRun: '2026-06-01', format: 'PDF' },
    { id: 'rep-2', name: 'Daily Agent Performance Summary', frequency: 'daily', lastRun: '2026-06-20', format: 'CSV' },
    { id: 'rep-3', name: 'Weekly AI Handoff Analytics', frequency: 'weekly', lastRun: '2026-06-15', format: 'PDF' },
  ]);

  return (
    <div className="space-y-6" role="region" aria-label="System Reports Catalog">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Scheduled Reports</h1>
          <p className="text-xs text-neutral-500">View and download automated performance, SLA auditing, and cost breakdown sheets.</p>
        </div>
        <button
          onClick={() => alert('New report setup wizard')}
          className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
        >
          Schedule Report
        </button>
      </div>

      {/* Reports listing table */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Available Reports</h2>
        
        <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
          <table className="w-full text-left divide-y divide-neutral-100">
            <thead className="bg-neutral-50 font-bold text-neutral-500">
              <tr>
                <th className="p-3">Report Name</th>
                <th className="p-3">Frequency</th>
                <th className="p-3">Last Run Date</th>
                <th className="p-3">Format</th>
                <th className="p-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {reports.map((rep) => (
                <tr key={rep.id}>
                  <td className="p-3 font-semibold text-neutral-800 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-neutral-400" />
                    <span>{rep.name}</span>
                  </td>
                  <td className="p-3 capitalize">{rep.frequency}</td>
                  <td className="p-3">{rep.lastRun}</td>
                  <td className="p-3 font-bold text-neutral-600">{rep.format}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => alert(`Downloading report: ${rep.name}`)}
                      className="p-1 text-primary-500 hover:text-primary-700 hover:underline font-semibold"
                      aria-label={`Download report ${rep.name}`}
                    >
                      <Download className="h-4.5 w-4.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
