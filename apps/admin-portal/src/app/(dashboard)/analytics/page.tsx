'use client';

import * as React from 'react';
import { Download, Calendar, Sparkles, Radio } from 'lucide-react';
import {
  useAnalyticsDashboard,
  useAnalyticsAiMetrics,
  useAnalyticsChannelMetrics,
  useAnalyticsAgentMetrics,
  useTriggerAnalyticsExport,
} from '../../../hooks/useAdminQueries';
import { Users } from 'lucide-react';

const TIME_RANGES = [
  { value: 'Last 7 Days', label: 'Last 7 Days' },
  { value: 'Last 30 Days', label: 'Last 30 Days' },
  { value: 'Last 90 Days', label: 'Last 90 Days' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('Last 30 Days');
  const [exportStatus, setExportStatus] = React.useState<string | null>(null);

  const { data: dashboard, isLoading: isDashboardLoading } = useAnalyticsDashboard(timeRange);
  const { data: aiMetrics, isLoading: isAiLoading } = useAnalyticsAiMetrics(timeRange);
  const { data: channelMetrics, isLoading: isChannelsLoading } = useAnalyticsChannelMetrics(timeRange);
  const { data: agentMetrics, isLoading: isAgentsLoading } = useAnalyticsAgentMetrics(timeRange);
  const exportMutation = useTriggerAnalyticsExport();

  const handleExport = () => {
    setExportStatus(null);
    exportMutation.mutate(
      { timeRange, format: 'CSV' },
      {
        onSuccess: () => setExportStatus("Export queued - we'll email it to you shortly."),
        onError: () => setExportStatus('Export failed to queue. Please try again.'),
      },
    );
  };

  const stats = dashboard
    ? [
        { label: 'Estimated Cost Savings', value: `$${dashboard.estimatedCostSavings.toLocaleString()}`, desc: 'AI-deflected queries cost savings' },
        { label: 'CSAT Score', value: `${dashboard.csatScore.toFixed(2)} / 5`, desc: 'Rating across all resolved threads' },
        { label: 'SLA Violation Rate', value: `${dashboard.slaViolationRate.toFixed(1)}%`, desc: `${dashboard.ticketsCount} tickets in range` },
      ]
    : [];

  return (
    <div className="space-y-6" role="region" aria-label="Platform Analytics Dashboard">
      {/* Header with filters and Export controls */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Analytics & Reports</h1>
          <p className="text-xs text-neutral-500">Analyze SLA metrics, AI deflection, CSAT records, and channel usage.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <div className="relative">
            <label htmlFor="analytics-date-range" className="sr-only">Date range</label>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              id="analytics-date-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-8 pr-8 py-1.5 border border-neutral-200 rounded-md bg-white text-neutral-800 focus:outline-none cursor-pointer"
            >
              {TIME_RANGES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="flex items-center gap-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 px-3 py-1.5 rounded-md transition disabled:opacity-60"
            aria-label="Export reports data"
          >
            <Download className="h-4 w-4" />
            <span>{exportMutation.isPending ? 'Queuing...' : 'Export Data'}</span>
          </button>
        </div>
      </div>

      {exportStatus && <p className="text-xs text-neutral-500 px-2">{exportStatus}</p>}

      {/* KPI Cards */}
      {isDashboardLoading ? (
        <p className="text-xs text-neutral-400">Loading metrics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">{stat.label}</span>
              <span className="text-xl font-extrabold text-neutral-900 mt-2 block">{stat.value}</span>
              <span className="text-[10px] text-neutral-500 block leading-none mt-1">{stat.desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reports Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Deflection */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <Sparkles className="h-4.5 w-4.5 text-cyan-500" />
            <span>AI Deflection Breakdown</span>
          </h2>
          {isAiLoading ? (
            <p className="text-xs text-neutral-400">Loading...</p>
          ) : aiMetrics ? (
            <div className="space-y-3.5 text-xs text-neutral-600">
              <div className="flex justify-between items-center py-1">
                <span>AI Resolution Rate</span>
                <span className="font-bold text-neutral-900">{aiMetrics.aiResolutionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Escalated to Agent</span>
                <span className="font-bold text-neutral-900">{aiMetrics.escalationRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>AI Requests Handled</span>
                <span className="font-bold text-neutral-900">{aiMetrics.aiRequests.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Estimated AI Spend</span>
                <span className="font-semibold text-success">${aiMetrics.estimatedCost.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">No AI activity in this range.</p>
          )}
        </div>

        {/* Channel Usage */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <Radio className="h-4.5 w-4.5" />
            <span>Channel Usage & Delivery</span>
          </h2>
          {isChannelsLoading ? (
            <p className="text-xs text-neutral-400">Loading...</p>
          ) : channelMetrics && channelMetrics.length > 0 ? (
            <div className="space-y-3.5 text-xs text-neutral-600">
              {channelMetrics.map((ch) => (
                <div key={ch.channelType} className="flex justify-between items-center py-1">
                  <span className="capitalize">{ch.channelType.toLowerCase().replace('_', ' ')}</span>
                  <span className="text-success font-bold">
                    {ch.deliverySuccessRate.toFixed(1)}% delivered &middot; {ch.messageCount.toLocaleString()} msgs
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">No channel activity in this range.</p>
          )}
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
          <Users className="h-4.5 w-4.5 text-indigo-500" />
          <span>Agent Performance summary</span>
        </h2>
        {isAgentsLoading ? (
          <p className="text-xs text-neutral-400">Loading metrics...</p>
        ) : agentMetrics && agentMetrics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100">
                <tr>
                  <th className="px-4 py-2">Agent Name</th>
                  <th className="px-4 py-2 text-right">Resolved</th>
                  <th className="px-4 py-2 text-right">Avg Response (s)</th>
                  <th className="px-4 py-2 text-right">Avg Resolution (s)</th>
                  <th className="px-4 py-2 text-right">CSAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {agentMetrics.map((agent) => (
                  <tr key={agent.agentId} className="hover:bg-neutral-50">
                    <td className="px-4 py-2 font-medium text-neutral-900">{agent.displayName || agent.agentId}</td>
                    <td className="px-4 py-2 text-right font-semibold">{agent.ticketsResolved}</td>
                    <td className="px-4 py-2 text-right">{Math.round(agent.avgResponseTime)}s</td>
                    <td className="px-4 py-2 text-right">{Math.round(agent.avgResolutionTime)}s</td>
                    <td className="px-4 py-2 text-right text-success font-semibold">{agent.csatScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 italic">No agent activity in this range.</p>
        )}
      </div>
    </div>
  );
}
