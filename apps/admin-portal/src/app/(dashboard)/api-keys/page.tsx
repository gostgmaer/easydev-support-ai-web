'use client';

import * as React from 'react';
import { Key, Plus, Trash2, Copy, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApiKeys, useCreateApiKey, useRevokeApiKey, useRotateApiKey } from '../../../hooks/useAdminQueries';

export default function ApiKeysPage() {
  const { data: keys, isLoading, isError } = useApiKeys();
  const createKeyMutation = useCreateApiKey();
  const revokeKeyMutation = useRevokeApiKey();
  const rotateKeyMutation = useRotateApiKey();

  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [scopesInput, setScopesInput] = React.useState('');
  const [revealedKey, setRevealedKey] = React.useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const scopes = scopesInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (!name.trim() || scopes.length === 0) return;

    createKeyMutation.mutate(
      { name, scopes },
      {
        onSuccess: (data) => {
          setRevealedKey(data.rawKey);
          setName('');
          setScopesInput('');
          setShowCreateForm(false);
        },
      },
    );
  };

  const handleRevokeKey = (id: string, keyName: string) => {
    if (confirm(`Are you sure you want to revoke API Key: ${keyName}?`)) {
      revokeKeyMutation.mutate({ id });
    }
  };

  const handleRotateKey = (id: string, keyName: string) => {
    if (confirm(`Rotate API Key "${keyName}"? The current key will stop working immediately.`)) {
      rotateKeyMutation.mutate({ id }, { onSuccess: (data) => setRevealedKey(data.rawKey) });
    }
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-success bg-success/15';
      case 'EXPIRED':
        return 'text-warning bg-warning/15';
      default:
        return 'text-neutral-500 bg-neutral-100';
    }
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
          onClick={() => setShowCreateForm((v) => !v)}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
        >
          <Plus className="h-4 w-4" />
          <span>Generate API Key</span>
        </button>
      </div>

      {revealedKey && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-xs space-y-2">
          <p className="font-bold text-warning flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            <span>Copy this key now - it will not be shown again</span>
          </p>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded p-2 font-mono text-neutral-800">
            <span className="flex-1 break-all">{revealedKey}</span>
            <button
              onClick={() => navigator.clipboard.writeText(revealedKey)}
              className="p-1 hover:bg-neutral-100 rounded shrink-0"
              aria-label="Copy API key"
            >
              <Copy className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          </div>
          <button onClick={() => setRevealedKey(null)} className="text-neutral-500 hover:text-neutral-700 font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="key-name" className="font-bold text-neutral-600">Key Name</label>
              <input
                id="key-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="CRM Sync Pipeline"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="key-scopes" className="font-bold text-neutral-600">Scopes (comma-separated)</label>
              <input
                id="key-scopes"
                required
                value={scopesInput}
                onChange={(e) => setScopesInput(e.target.value)}
                placeholder="tickets:read, customers:write"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createKeyMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-3.5 py-2 rounded-md disabled:opacity-60"
          >
            {createKeyMutation.isPending ? 'Generating...' : 'Generate Key'}
          </button>
        </form>
      )}

      {/* Keys List */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Key className="h-4.5 w-4.5" />
          <span>Active API Keys</span>
        </h2>

        {isLoading && <p className="text-xs text-neutral-400">Loading keys...</p>}
        {isError && <p className="text-xs text-danger-600">Failed to load API keys.</p>}

        {keys && (
          keys.length > 0 ? (
            <div className="overflow-x-auto border border-neutral-100 rounded-lg text-xs">
              <table className="w-full text-left divide-y divide-neutral-100">
                <thead className="bg-neutral-50 font-bold text-neutral-500">
                  <tr>
                    <th className="p-3">Key Name</th>
                    <th className="p-3">Token Prefix</th>
                    <th className="p-3">Permission Scopes</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-right">Revoke</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {keys.map((k) => (
                    <tr key={k.id}>
                      <td className="p-3 font-semibold text-neutral-800">{k.name}</td>
                      <td className="p-3 font-mono text-neutral-500">{k.keyPrefix}...</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes.map((scope) => (
                            <span key={scope} className="bg-neutral-100 border border-neutral-200 text-[10px] px-1.5 py-0.25 rounded font-semibold text-neutral-700">
                              {scope}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${getStatusTone(k.status)}`}>
                          {k.status}
                        </span>
                      </td>
                      <td className="p-3">{new Date(k.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        {k.status === 'ACTIVE' && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleRotateKey(k.id, k.name)}
                              disabled={rotateKeyMutation.isPending}
                              className="text-neutral-400 hover:text-primary-600 p-1"
                              aria-label={`Rotate API Key ${k.name}`}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRevokeKey(k.id, k.name)}
                              className="text-neutral-400 hover:text-danger p-1"
                              aria-label={`Revoke API Key ${k.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic py-8 text-center">No active API keys found. Generate a key to begin scripting.</p>
          )
        )}
      </div>
    </div>
  );
}
