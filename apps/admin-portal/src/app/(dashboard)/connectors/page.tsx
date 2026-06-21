'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Database, Search } from 'lucide-react';
import { useConnectorsList, useSetConnectorStatus } from '@/hooks/useAdminQueries';
import type { Connector } from '@/store/adminStore';

const STATUS_TONE: Record<Connector['status'], string> = {
  ACTIVE: 'text-success bg-success/15',
  PAUSED: 'text-warning bg-warning/15',
  DISABLED: 'text-neutral-500 bg-neutral-100',
  ERROR: 'text-danger bg-danger/15',
  DRAFT: 'text-neutral-400 bg-neutral-100',
};

const HEALTH_TONE: Record<Connector['healthStatus'], string> = {
  HEALTHY: 'text-success',
  DEGRADED: 'text-warning',
  UNHEALTHY: 'text-danger',
  UNKNOWN: 'text-neutral-400',
};

export default function ConnectorsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: connectors = [], isLoading } = useConnectorsList();
  const setStatusMutation = useSetConnectorStatus();

  const [activeTab, setActiveTab] = React.useState<'installed' | 'marketplace' | 'logs'>('installed');
  const [search, setSearch] = React.useState('');

  // Sync tab state with sub-routes
  React.useEffect(() => {
    if (pathname.includes('/marketplace')) {
      setActiveTab('marketplace');
    } else if (pathname.includes('/logs')) {
      setActiveTab('logs');
    } else {
      setActiveTab('installed');
    }
  }, [pathname]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'installed') {
      router.push('/connectors');
    } else {
      router.push(`/connectors/${tab}`);
    }
  };

  const filteredConnectors = connectors.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.connectorType.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6" role="region" aria-label="Connector Platform Manager">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Connectors & Integrations</h1>
          <p className="text-xs text-neutral-500">Manage installed integrations and their health.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-md text-xs font-bold self-start md:self-center gap-1">
          {(['installed', 'marketplace', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md capitalize transition ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs min-h-[300px]">
        {/* 1. INSTALLED CONNECTORS TAB */}
        {activeTab === 'installed' && (
          <div className="space-y-4">
            <div className="relative mb-5 w-72">
              <label htmlFor="connector-search-input" className="sr-only">Search connectors</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                id="connector-search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search integrations..."
                className="w-full text-xs rounded border border-neutral-200 pl-9 pr-3 py-2 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {isLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading integrations...</p>
            ) : filteredConnectors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConnectors.map((item) => (
                  <div key={item.id} className="p-4 border border-neutral-200 rounded-lg flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary-50 text-primary-600 rounded-md flex items-center justify-center border border-primary-100">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-neutral-800 block">{item.name}</span>
                        <span className={`text-[10px] block mt-0.5 ${HEALTH_TONE[item.healthStatus]}`}>
                          {item.connectorType} • {item.healthStatus.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${STATUS_TONE[item.status]}`}>
                        {item.status}
                      </span>
                      {item.status === 'ACTIVE' ? (
                        <button
                          onClick={() => setStatusMutation.mutate({ id: item.id, action: 'pause' })}
                          className="text-xs text-neutral-500 hover:text-primary-600 font-semibold"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => setStatusMutation.mutate({ id: item.id, action: 'activate' })}
                          className="text-xs text-neutral-500 hover:text-primary-600 font-semibold"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-neutral-400">
                <Database className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                <p>No connectors installed yet.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. MARKETPLACE TAB - no backend catalog-browsing endpoint exists yet
            (connectors are installed via type-specific setup, not a generic
            catalog), so this is an honest stub rather than a fake browse list. */}
        {activeTab === 'marketplace' && (
          <div className="text-center py-12 text-xs text-neutral-400">
            <p>Connector marketplace browsing isn&apos;t available yet.</p>
            <p className="mt-1">Use the installed-connectors API to register a new integration.</p>
          </div>
        )}

        {/* 3. LOGS TAB - the real backend exposes execution logs per-connector
            (GET /v1/connectors/:id/executions), not a cross-connector feed -
            stubbed honestly until that aggregation is built. */}
        {activeTab === 'logs' && (
          <div className="text-center py-12 text-xs text-neutral-400">
            <p>A combined sync-execution log across all connectors isn&apos;t available yet.</p>
            <p className="mt-1">Open a connector from the Installed tab to view its own execution history.</p>
          </div>
        )}
      </div>
    </div>
  );
}
