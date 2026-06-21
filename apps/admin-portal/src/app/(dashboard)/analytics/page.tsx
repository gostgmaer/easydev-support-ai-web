'use client';

import * as React from 'react';
import { BarChart3, Download, Calendar, Filter, Sparkles, Database, Users } from 'lucide-react';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState('30-days');
  const [filterType, setFilterType] = React.useState('all');

  const stats = [
    { label: 'Deflection Revenue Saved', value: '$8,420', desc: 'AI solved queries cost savings' },
    { label: 'Total API Calls Routed', value: '424K', desc: 'Successful connector queries' },
    { label: 'Agent Average CSAT', value: '4.85 / 5', desc: 'Rating across all resolved threads' },
  ];

  return (
    <div className="space-y-6" role="region" aria-label="Platform Analytics Dashboard">
      {/* Header with filters and Export controls */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Analytics & Reports</h1>
          <p className="text-xs text-neutral-500">Analyze SLA metrics, connector logs usage, CSAT records, and token costs.</p>
        </div>

        {/* Date Filter & Export buttons */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <div className="relative">
            <label htmlFor="analytics-date-range" className="sr-only">Date range</label>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              id="analytics-date-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-8 pr-8 py-1.5 border border-neutral-200 rounded-md bg-white text-neutral-800 focus:outline-none cursor-pointer"
            >
              <option value="7-days">Last 7 Days</option>
              <option value="30-days">Last 30 Days</option>
              <option value="90-days">Last 90 Days</option>
            </select>
          </div>

          <button
            onClick={() => alert('Initiating CSV/PDF report download')}
            className="flex items-center gap-1.5 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 px-3 py-1.5 rounded-md transition"
            aria-label="Export reports data"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-neutral-200 rounded-lg p-5 shadow-xs">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">{stat.label}</span>
            <span className="text-xl font-extrabold text-neutral-900 mt-2 block">{stat.value}</span>
            <span className="text-[10px] text-neutral-500 block leading-none mt-1">{stat.desc}</span>
          </div>
        ))}
      </div>

      {/* Reports Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deflection Reports */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <Sparkles className="h-4.5 w-4.5 text-cyan-500" />
            <span>AI Deflection Breakdown</span>
          </h2>
          <div className="space-y-3.5 text-xs text-neutral-600">
            <div className="flex justify-between items-center py-1">
              <span>Automatic Resolutions</span>
              <span className="font-bold text-neutral-900">1,240 (85.2%)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>Agent Escalation Handoffs</span>
              <span className="font-bold text-neutral-900">180 (12.4%)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>Total Tokens Saved</span>
              <span className="font-bold text-success font-semibold">4.8M tokens</span>
            </div>
          </div>
        </div>

        {/* Connectors Usage Reports */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <Database className="h-4.5 w-4.5" />
            <span>API Connector Routing Metrics</span>
          </h2>
          <div className="space-y-3.5 text-xs text-neutral-600">
            <div className="flex justify-between items-center py-1">
              <span>Shopify Connector Success Rate</span>
              <span className="text-success font-bold font-semibold">99.8%</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>Zendesk Migration Success Rate</span>
              <span className="text-success font-bold font-semibold">98.4%</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>Slack Alerts Success Rate</span>
              <span className="text-success font-bold font-semibold">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
