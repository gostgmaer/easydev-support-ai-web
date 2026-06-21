'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Database, Search, Cpu, RefreshCw, Layers, ShieldCheck, Play } from 'lucide-react';
import { useConnectorsList, useUpdateConnector } from '@/hooks/useAdminQueries';

interface MarketplaceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  installed: boolean;
}

export default function ConnectorsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: installed = [], isLoading } = useConnectorsList();
  const updateConnectorMutation = useUpdateConnector();

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

  const marketplaceCatalog: MarketplaceItem[] = [
    { id: 'm-1', name: 'Salesforce CRM', category: 'CRM', description: 'Synchronize customer profiles and lifecycle fields.', installed: false },
    { id: 'm-2', name: 'Zendesk Support', category: 'Help Desk', description: 'Migrate tickets and merge user history.', installed: false },
    { id: 'm-3', name: 'Slack Notifications', category: 'Communication', description: 'Post critical Tier-2 incident alerts directly to channels.', installed: true },
    { id: 'm-4', name: 'Shopify Storefront', category: 'Ecommerce', description: 'Fetch orders list details and tracking information.', installed: true },
  ];

  const filteredMarketplace = marketplaceCatalog.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleInstall = (id: string, currentlyInstalled: boolean) => {
    alert(`${currentlyInstalled ? 'Uninstalled' : 'Installed'} connector successfully.`);
  };

  return (
    <div className="space-y-6" role="region" aria-label="Connector Platform Manager">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Connectors & Integrations</h1>
          <p className="text-xs text-neutral-500">Link external CRMs, notification channels, ecommerce storefronts, and track API logs.</p>
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
        {/* Search Bar for directory filtering */}
        {activeTab !== 'logs' && (
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
        )}

        {/* 1. INSTALLED CONNECTORS TAB */}
        {activeTab === 'installed' && (
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading integrations...</p>
            ) : installed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {installed.map((item) => (
                  <div key={item.id} className="p-4 border border-neutral-200 rounded-lg flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-primary-50 text-primary-600 rounded-md flex items-center justify-center border border-primary-100">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-neutral-800 block">{item.name}</span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">{item.category} • Health: {item.health}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                        item.status === 'active' ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'
                      }`}>
                        {item.status}
                      </span>
                      <button
                        onClick={() => updateConnectorMutation.mutate({ id: item.id, status: item.status === 'active' ? 'inactive' : 'active' })}
                        className="text-xs text-neutral-500 hover:text-primary-600 font-semibold"
                      >
                        {item.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-neutral-400">
                <Database className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                <p>No active integrations. Explore the marketplace to link applications.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. MARKETPLACE CATALOG TAB */}
        {activeTab === 'marketplace' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMarketplace.map((item) => (
              <div key={item.id} className="p-5 border border-neutral-200 rounded-lg flex flex-col justify-between bg-white shadow-3xs space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-neutral-800">{item.name}</span>
                    <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[9px] uppercase font-black rounded-md">{item.category}</span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-normal">{item.description}</p>
                </div>
                
                <div className="flex justify-end gap-2 border-t border-neutral-50 pt-3">
                  <button
                    onClick={() => handleToggleInstall(item.id, item.installed)}
                    className={`text-xs font-bold px-3 py-1.5 rounded transition ${
                      item.installed
                        ? 'border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20'
                        : 'bg-neutral-800 hover:bg-neutral-900 text-white'
                    }`}
                  >
                    {item.installed ? 'Uninstall' : 'Install integration'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Sync Execution log</h2>
              <button onClick={() => alert('Refreshing logs')} className="p-1 rounded text-neutral-500 hover:bg-neutral-100">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            
            {/* Log Table representation */}
            <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
              <table className="w-full text-left divide-y divide-neutral-100">
                <thead className="bg-neutral-50 font-bold text-neutral-500">
                  <tr>
                    <th className="p-3">Integration</th>
                    <th className="p-3">Event Trigger</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Time</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  <tr>
                    <td className="p-3 font-semibold text-neutral-800">Shopify Gateway</td>
                    <td className="p-3">order:created webhook</td>
                    <td className="p-3"><span className="text-[10px] uppercase font-bold text-success bg-success/15 px-1.5 py-0.25 rounded">success</span></td>
                    <td className="p-3">12:35 PM</td>
                    <td className="p-3 text-right"><span className="text-neutral-300">-</span></td>
                  </tr>
                  <tr className="bg-danger-50/5">
                    <td className="p-3 font-semibold text-neutral-800">Salesforce CRM</td>
                    <td className="p-3">customer:profile sync</td>
                    <td className="p-3"><span className="text-[10px] uppercase font-bold text-danger bg-danger/15 px-1.5 py-0.25 rounded animate-pulse">failed</span></td>
                    <td className="p-3">11:14 AM</td>
                    <td className="p-3 text-right">
                      <button onClick={() => alert('Retrying sync execution')} className="text-primary-500 hover:underline font-semibold flex items-center gap-1 ml-auto">
                        <Play className="h-3 w-3" /> Retry
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
