'use client';

import * as React from 'react';
import { Key, Plus, Trash2, ShieldCheck, Copy, Eye, EyeOff } from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  keySnippet: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = React.useState<ApiKeyItem[]>([
    { id: 'key-1', name: 'CRM Sync Pipeline', keySnippet: 'easydev_live_8f3d...2f1a', scopes: ['tickets:read', 'customers:write'], createdAt: '2026-05-15', lastUsed: '2026-06-20' },
    { id: 'key-2', name: 'Analytics Reader Token', keySnippet: 'easydev_live_1d2e...4e5f', scopes: ['metrics:read'], createdAt: '2026-06-01', lastUsed: '2026-06-21' },
  ]);

  const [showFullKeys, setShowFullKeys] = React.useState<Record<string, boolean>>({});

  const handleRevokeKey = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke API Key: ${name}?`)) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const handleGenerateKey = () => {
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: prompt('Enter a descriptive name for the API Key:') || 'Unnamed API Key',
      keySnippet: `easydev_live_${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
      scopes: ['tickets:read'],
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    setKeys((prev) => [...prev, newKey]);
  };

  return (
    <div className="space-y-6" role="region" aria-label="API Access Credentials">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-neutral-900">API Access Keys</h1>
          <p className="text-xs text-neutral-500">Generate, track, and revoke access keys used by external webhook scripts and CRM connectors.</p>
        </div>
        <button
          onClick={handleGenerateKey}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
        >
          <Plus className="h-4 w-4" />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* Keys List */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Key className="h-4.5 w-4.5" />
          <span>Active API Keys</span>
        </h2>

        {keys.length > 0 ? (
          <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
            <table className="w-full text-left divide-y divide-neutral-100">
              <thead className="bg-neutral-50 font-bold text-neutral-500">
                <tr>
                  <th className="p-3">Key Name</th>
                  <th className="p-3">Token Snippet</th>
                  <th className="p-3">Permission Scopes</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Last Active</th>
                  <th className="p-3 text-right">Revoke</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td className="p-3 font-semibold text-neutral-800">{k.name}</td>
                    <td className="p-3 font-mono text-neutral-500 flex items-center gap-2">
                      <span>{k.keySnippet}</span>
                      <button onClick={() => alert('Token snippet copied to clipboard')} className="p-1 hover:bg-neutral-100 rounded">
                        <Copy className="h-3.5 w-3.5 text-neutral-400" />
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map((scope, idx) => (
                          <span key={idx} className="bg-neutral-100 border border-neutral-200 text-[10px] px-1.5 py-0.25 rounded font-semibold text-neutral-700">
                            {scope}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">{k.createdAt}</td>
                    <td className="p-3 font-semibold text-neutral-600">{k.lastUsed}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id, k.name)}
                        className="text-neutral-400 hover:text-danger p-1"
                        aria-label={`Revoke API Key ${k.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 italic py-8 text-center">No active API keys found. Generate a key to begin scripting.</p>
        )}
      </div>
    </div>
  );
}
