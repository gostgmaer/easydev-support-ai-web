'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Database, Search, Settings, Plus, RefreshCw } from 'lucide-react';
import { toAppError } from '@easydev/utils';
import {
  useConnectorsList,
  useSetConnectorStatus,
  useInstallConnector,
  useConfigureConnectorApiKey,
  useConfigureConnectorOAuth,
  useConnectorExecutions,
  useRetryConnectorExecution,
  useConnectorWebhooks,
  useImportConnectorOpenApi,
  useImportConnectorSwagger,
  useCheckConnectorHealth,
  useConnectorInstances,
  useCreateConnectorInstance,
  useDeleteConnectorInstance,
  useConnectorAuditLog,
  useConnectorExecutionById,
  useMapConnectorCapabilities,
} from '@/hooks/useAdminQueries';
import type { Connector } from '@/store/adminStore';

const EXECUTION_STATUS_TONE: Record<string, string> = {
  SUCCESS: 'text-success bg-success/15',
  FAILED: 'text-danger bg-danger/15',
  CIRCUIT_OPEN: 'text-danger bg-danger/15',
  RETRYING: 'text-warning bg-warning/15',
  RUNNING: 'text-primary-600 bg-primary-50',
  PENDING: 'text-neutral-500 bg-neutral-100',
};

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

const CONNECTOR_TYPES = [
  'REST_API',
  'GRAPHQL',
  'WEBHOOK',
  'SHOPIFY',
  'WOOCOMMERCE',
  'MAGENTO',
  'HUBSPOT',
  'SALESFORCE',
  'ZOHO',
  'JIRA',
  'CUSTOM',
] as const;

const AUTH_TYPES = ['NONE', 'API_KEY', 'BEARER', 'BASIC', 'OAUTH2', 'HMAC'] as const;

function InstallConnectorForm({ onInstalled }: { onInstalled: () => void }) {
  const installMutation = useInstallConnector();
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [connectorType, setConnectorType] = React.useState<string>(CONNECTOR_TYPES[0]);
  const [authType, setAuthType] = React.useState<string>(AUTH_TYPES[0]);
  const [baseUrl, setBaseUrl] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    installMutation.mutate(
      {
        name: name.trim(),
        slug: slug.trim(),
        connectorType,
        authType,
        baseUrl: baseUrl.trim() || undefined,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setName('');
          setSlug('');
          setBaseUrl('');
          setDescription('');
          onInstalled();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs max-w-2xl">
      {installMutation.isError && (
        <p className="text-danger-600 bg-danger/10 border border-danger/20 rounded p-2">
          {toAppError(installMutation.error).message}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="connector-name" className="font-bold text-neutral-600">Name</label>
          <input
            id="connector-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Shopify Storefront"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="connector-slug" className="font-bold text-neutral-600">Slug</label>
          <input
            id="connector-slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="shopify-storefront"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="connector-type" className="font-bold text-neutral-600">Connector Type</label>
          <select
            id="connector-type"
            value={connectorType}
            onChange={(e) => setConnectorType(e.target.value)}
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CONNECTOR_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="connector-auth-type" className="font-bold text-neutral-600">Auth Type</label>
          <select
            id="connector-auth-type"
            value={authType}
            onChange={(e) => setAuthType(e.target.value)}
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {AUTH_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="connector-base-url" className="font-bold text-neutral-600">Base URL (optional)</label>
          <input
            id="connector-base-url"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label htmlFor="connector-description" className="font-bold text-neutral-600">Description (optional)</label>
          <input
            id="connector-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this integration is used for"
            className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={installMutation.isPending}
        className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-3.5 py-2 rounded-md disabled:opacity-60"
      >
        {installMutation.isPending ? 'Installing...' : 'Install Connector'}
      </button>
      <p className="text-neutral-400">
        Connectors are installed in DRAFT status. Configure credentials from the Installed tab, then activate.
      </p>
    </form>
  );
}

function ConfigureConnectorForm({ connector }: { connector: Connector }) {
  const configureApiKeyMutation = useConfigureConnectorApiKey();
  const configureOAuthMutation = useConfigureConnectorOAuth();

  const [apiKey, setApiKey] = React.useState('');
  const [headerName, setHeaderName] = React.useState('X-API-Key');
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');
  const [tokenUrl, setTokenUrl] = React.useState('');
  const [authUrl, setAuthUrl] = React.useState('');
  const [scopesInput, setScopesInput] = React.useState('');

  const [savedMessage, setSavedMessage] = React.useState<string | null>(null);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !headerName.trim()) return;
    configureApiKeyMutation.mutate(
      { id: connector.id, apiKey: apiKey.trim(), headerName: headerName.trim() },
      {
        onSuccess: () => {
          setApiKey('');
          setSavedMessage('API key credential saved.');
        },
      },
    );
  };

  const handleSaveOAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim() || !tokenUrl.trim()) return;
    const scopes = scopesInput.split(',').map((s) => s.trim()).filter(Boolean);
    configureOAuthMutation.mutate(
      {
        id: connector.id,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
        tokenUrl: tokenUrl.trim(),
        authUrl: authUrl.trim() || undefined,
        scopes: scopes.length > 0 ? scopes : undefined,
      },
      {
        onSuccess: () => {
          setClientSecret('');
          setSavedMessage('OAuth credential saved.');
        },
      },
    );
  };

  return (
    <div className="mt-3 border-t border-neutral-200 pt-3 text-xs space-y-3">
      {savedMessage && <p className="text-success font-semibold">{savedMessage}</p>}

      {connector.authType === 'API_KEY' && (
        <form onSubmit={handleSaveApiKey} className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor={`apikey-${connector.id}`} className="font-bold text-neutral-600">API Key</label>
              <input
                id={`apikey-${connector.id}`}
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`header-${connector.id}`} className="font-bold text-neutral-600">Header Name</label>
              <input
                id={`header-${connector.id}`}
                required
                value={headerName}
                onChange={(e) => setHeaderName(e.target.value)}
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={configureApiKeyMutation.isPending}
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-3 py-1.5 rounded-md disabled:opacity-60"
          >
            {configureApiKeyMutation.isPending ? 'Saving...' : 'Save API Key'}
          </button>
        </form>
      )}

      {connector.authType === 'OAUTH2' && (
        <form onSubmit={handleSaveOAuth} className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor={`client-id-${connector.id}`} className="font-bold text-neutral-600">Client ID</label>
              <input
                id={`client-id-${connector.id}`}
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`client-secret-${connector.id}`} className="font-bold text-neutral-600">Client Secret</label>
              <input
                id={`client-secret-${connector.id}`}
                type="password"
                required
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`token-url-${connector.id}`} className="font-bold text-neutral-600">Token URL</label>
              <input
                id={`token-url-${connector.id}`}
                type="url"
                required
                value={tokenUrl}
                onChange={(e) => setTokenUrl(e.target.value)}
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`auth-url-${connector.id}`} className="font-bold text-neutral-600">Auth URL (optional)</label>
              <input
                id={`auth-url-${connector.id}`}
                type="url"
                value={authUrl}
                onChange={(e) => setAuthUrl(e.target.value)}
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label htmlFor={`scopes-${connector.id}`} className="font-bold text-neutral-600">Scopes (comma-separated, optional)</label>
              <input
                id={`scopes-${connector.id}`}
                value={scopesInput}
                onChange={(e) => setScopesInput(e.target.value)}
                placeholder="read_orders, write_products"
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={configureOAuthMutation.isPending}
            className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold px-3 py-1.5 rounded-md disabled:opacity-60"
          >
            {configureOAuthMutation.isPending ? 'Saving...' : 'Save OAuth Credential'}
          </button>
        </form>
      )}

      {connector.authType !== 'API_KEY' && connector.authType !== 'OAUTH2' && (
        <p className="text-neutral-400">
          Credential configuration for {connector.authType} auth isn&apos;t available yet - only API Key and OAuth2 are wired up.
        </p>
      )}
    </div>
  );
}

function ExecutionDetailPanel({ executionId }: { executionId: string }) {
  const { data: exec, isLoading } = useConnectorExecutionById(executionId);
  if (isLoading) return <p className="text-[10px] text-neutral-400 animate-pulse p-2">Loading detail…</p>;
  if (!exec) return null;
  return (
    <div className="bg-neutral-50 border border-neutral-100 rounded p-2 text-[10px] space-y-1 mt-1">
      {!!exec.requestPayload && (
        <div>
          <span className="font-bold text-neutral-500 uppercase">Request: </span>
          <span className="font-mono break-all">{JSON.stringify(exec.requestPayload)}</span>
        </div>
      )}
      {!!exec.responsePayload && (
        <div>
          <span className="font-bold text-neutral-500 uppercase">Response: </span>
          <span className="font-mono break-all">{JSON.stringify(exec.responsePayload)}</span>
        </div>
      )}
      {exec.error && (
        <div><span className="font-bold text-danger uppercase">Error: </span><span>{exec.error}</span></div>
      )}
    </div>
  );
}

function ExecutionHistory({ connectorId }: { connectorId: string }) {
  const { data: executions = [], isLoading } = useConnectorExecutions(connectorId);
  const retryMutation = useRetryConnectorExecution();
  const [expandedExecId, setExpandedExecId] = React.useState<string | null>(null);

  return (
    <div className="mt-3 border-t border-neutral-200 pt-3 text-xs space-y-2">
      <h3 className="font-bold text-neutral-600">Recent Executions</h3>
      {isLoading ? (
        <p className="text-neutral-400">Loading executions...</p>
      ) : executions.length === 0 ? (
        <p className="text-neutral-400">No executions recorded yet for this connector.</p>
      ) : (
        <ul className="space-y-1.5">
          {executions.map((exec) => {
            const canRetry = exec.status === 'FAILED' || exec.status === 'CIRCUIT_OPEN';
            const isRetryingThis =
              retryMutation.isPending && retryMutation.variables?.executionId === exec.id;
            return (
              <li key={exec.id} className="border border-neutral-200 rounded bg-white">
                <div
                  className="flex items-center justify-between gap-3 p-2 cursor-pointer hover:bg-neutral-50"
                  onClick={() => setExpandedExecId((cur) => cur === exec.id ? null : exec.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded shrink-0 ${EXECUTION_STATUS_TONE[exec.status] ?? 'text-neutral-500 bg-neutral-100'}`}>
                      {exec.status}
                    </span>
                    <span className="text-neutral-700 font-semibold truncate">{exec.capabilityType}</span>
                    <span className="text-neutral-400 shrink-0">
                      attempt {exec.attempt} • {new Date(exec.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {canRetry && (
                    <button
                      onClick={(e) => { e.stopPropagation(); retryMutation.mutate({ connectorId, executionId: exec.id }); }}
                      disabled={isRetryingThis}
                      className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold shrink-0 disabled:opacity-60"
                    >
                      <RefreshCw className={`h-3 w-3 ${isRetryingThis ? 'animate-spin' : ''}`} />
                      {isRetryingThis ? 'Retrying...' : 'Retry'}
                    </button>
                  )}
                </div>
                {expandedExecId === exec.id && <ExecutionDetailPanel executionId={exec.id} />}
              </li>
            );
          })}
        </ul>
      )}
      {retryMutation.isError && (
        <p className="text-danger-600 bg-danger/10 border border-danger/20 rounded p-2">
          {toAppError(retryMutation.error).message}
        </p>
      )}
    </div>
  );
}

function ConnectorCapabilitiesPanel({ connectorId }: { connectorId: string }) {
  const mapCapabilities = useMapConnectorCapabilities();
  const [rows, setRows] = React.useState([{ type: '', endpoint: '', method: 'GET' }]);

  const addRow = () => setRows((r) => [...r, { type: '', endpoint: '', method: 'GET' }]);
  const updateRow = (i: number, field: string, value: string) =>
    setRows((r) => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = rows.filter((r) => r.type.trim() && r.endpoint.trim() && r.method.trim());
    if (!valid.length) return;
    mapCapabilities.mutate(
      { id: connectorId, capabilities: valid.map((r) => ({ type: r.type.trim(), endpoint: r.endpoint.trim(), method: r.method.trim() })) },
      { onSuccess: () => setRows([{ type: '', endpoint: '', method: 'GET' }]) },
    );
  };

  return (
    <div className="mt-3 border-t border-neutral-200 pt-3 text-xs space-y-2">
      <h3 className="font-bold text-neutral-600">Map Capabilities</h3>
      <p className="text-neutral-400">Define the capability types this connector exposes (e.g. get_order, list_products).</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <input value={row.type} onChange={(e) => updateRow(i, 'type', e.target.value)} placeholder="Type (e.g. get_order)" className="border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <input value={row.endpoint} onChange={(e) => updateRow(i, 'endpoint', e.target.value)} placeholder="Endpoint (/orders/:id)" className="border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <select value={row.method} onChange={(e) => updateRow(i, 'method', e.target.value)} className="border border-neutral-200 rounded px-2 py-1.5 bg-white">
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <button type="button" onClick={addRow} className="text-[10px] font-bold text-primary-600 hover:underline">+ Add Row</button>
          <button type="submit" disabled={mapCapabilities.isPending} className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-[10px] rounded px-3 py-1.5 disabled:opacity-50">
            {mapCapabilities.isPending ? 'Saving…' : 'Save Capabilities'}
          </button>
          {mapCapabilities.isSuccess && <span className="text-success">Saved.</span>}
        </div>
      </form>
    </div>
  );
}

function ConnectorHealthPanel({ connectorId }: { connectorId: string }) {
  const checkHealth = useCheckConnectorHealth();
  const [result, setResult] = React.useState<{ status: string; latencyMs: number } | null>(null);
  return (
    <div className="mt-3 border-t border-neutral-200 pt-3 text-xs space-y-2">
      <h3 className="font-bold text-neutral-600">Health Check</h3>
      <div className="flex items-center gap-3">
        <button
          onClick={() => checkHealth.mutate(connectorId, { onSuccess: setResult })}
          disabled={checkHealth.isPending}
          className="flex items-center gap-1.5 text-xs font-bold border border-neutral-200 rounded px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${checkHealth.isPending ? 'animate-spin' : ''}`} />
          {checkHealth.isPending ? 'Checking…' : 'Run Health Check'}
        </button>
        {result && (
          <span className={`font-semibold ${result.status === 'healthy' ? 'text-success' : 'text-danger'}`}>
            {result.status} · {result.latencyMs}ms
          </span>
        )}
        {checkHealth.isError && <span className="text-danger">Health check failed.</span>}
      </div>
    </div>
  );
}

function ConnectorInstancesPanel({ connectorId }: { connectorId: string }) {
  const { data: instances = [], isLoading } = useConnectorInstances(connectorId);
  const createInstance = useCreateConnectorInstance();
  const deleteInstance = useDeleteConnectorInstance();
  const [newName, setNewName] = React.useState('');

  return (
    <div className="mt-3 border-t border-neutral-200 pt-3 text-xs space-y-2">
      <h3 className="font-bold text-neutral-600">Instances</h3>
      {isLoading ? (
        <p className="text-neutral-400">Loading instances…</p>
      ) : instances.length === 0 ? (
        <p className="text-neutral-400">No instances created.</p>
      ) : (
        <ul className="space-y-1.5">
          {instances.map((inst) => (
            <li key={inst.id} className="flex items-center justify-between gap-2 p-2 border border-neutral-100 rounded bg-white">
              <div>
                <span className="font-semibold text-neutral-800">{inst.instanceName}</span>
                <span className={`ml-2 text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${inst.status === 'ACTIVE' ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'}`}>
                  {inst.status}
                </span>
              </div>
              <button
                onClick={() => { if (confirm(`Delete instance "${inst.instanceName}"?`)) deleteInstance.mutate({ connectorId, instanceId: inst.id }); }}
                disabled={deleteInstance.isPending}
                className="text-danger hover:underline text-[10px] font-bold disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          createInstance.mutate({ connectorId, instanceName: newName.trim() }, { onSuccess: () => setNewName('') });
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Instance name…"
          className="flex-1 border border-neutral-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={!newName.trim() || createInstance.isPending}
          className="text-xs font-bold bg-neutral-800 text-white rounded px-2.5 py-1.5 hover:bg-neutral-900 disabled:opacity-50"
        >
          {createInstance.isPending ? 'Creating…' : 'Add Instance'}
        </button>
      </form>
    </div>
  );
}

function ConnectorAuditPanel({ connectorId }: { connectorId: string }) {
  const { data, isLoading } = useConnectorAuditLog(connectorId);
  const records = data?.data ?? [];
  return (
    <div className="mt-3 border-t border-neutral-200 pt-3 text-xs space-y-2">
      <h3 className="font-bold text-neutral-600">Audit Log</h3>
      {isLoading ? (
        <p className="text-neutral-400">Loading audit log…</p>
      ) : records.length === 0 ? (
        <p className="text-neutral-400">No audit events.</p>
      ) : (
        <ul className="space-y-1 max-h-40 overflow-y-auto">
          {records.slice(0, 20).map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 p-1.5 border border-neutral-100 rounded bg-white">
              <span className="font-semibold text-neutral-700 truncate">{r.action}</span>
              <span className="text-[10px] text-neutral-400 shrink-0">{new Date(r.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ConnectorWebhooks({ connectorId }: { connectorId: string }) {
  const { data: webhooks = [], isLoading } = useConnectorWebhooks(connectorId);

  return (
    <div className="mt-3 border-t border-neutral-200 pt-3 text-xs space-y-2">
      <h3 className="font-bold text-neutral-600">Registered Webhooks</h3>
      {isLoading ? (
        <p className="text-neutral-400">Loading webhooks...</p>
      ) : webhooks.length === 0 ? (
        <p className="text-neutral-400">No webhooks registered for this connector.</p>
      ) : (
        <ul className="space-y-1.5">
          {webhooks.map((webhook: any) => (
            <li key={webhook.id} className="flex flex-col gap-1 p-2 border border-neutral-200 rounded bg-white">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-neutral-800">{webhook.url || webhook.endpoint}</span>
                <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${webhook.status === 'ACTIVE' ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'}`}>
                  {webhook.status || 'UNKNOWN'}
                </span>
              </div>
              {webhook.events && webhook.events.length > 0 && (
                <span className="text-[10px] text-neutral-500">Events: {webhook.events.join(', ')}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ConnectorsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: connectors = [], isLoading } = useConnectorsList();
  const setStatusMutation = useSetConnectorStatus();

  const [activeTab, setActiveTab] = React.useState<'installed' | 'marketplace' | 'logs'>('installed');
  const [search, setSearch] = React.useState('');
  const [expandedConnectorId, setExpandedConnectorId] = React.useState<string | null>(null);
  const [showImportForm, setShowImportForm] = React.useState<'openapi' | 'swagger' | null>(null);
  const [importUrl, setImportUrl] = React.useState('');
  const [importName, setImportName] = React.useState('');
  const importOpenApi = useImportConnectorOpenApi();
  const importSwagger = useImportConnectorSwagger();

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
            <div className="flex items-center justify-between gap-3">
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
              <div className="flex items-center gap-2 mb-5">
                <button
                  onClick={() => handleTabChange('marketplace')}
                  className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 py-2 rounded-md transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Install Connector</span>
                </button>
                <button
                  onClick={() => setShowImportForm(showImportForm === 'openapi' ? null : 'openapi')}
                  className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 font-bold text-xs px-3 py-2 rounded-md hover:bg-neutral-50 transition"
                >
                  OpenAPI Import
                </button>
                <button
                  onClick={() => setShowImportForm(showImportForm === 'swagger' ? null : 'swagger')}
                  className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 font-bold text-xs px-3 py-2 rounded-md hover:bg-neutral-50 transition"
                >
                  Swagger Import
                </button>
              </div>
            </div>

            {showImportForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const mutation = showImportForm === 'openapi' ? importOpenApi : importSwagger;
                  mutation.mutate(
                    { url: importUrl.trim() || undefined, name: importName.trim() },
                    { onSuccess: () => { setShowImportForm(null); setImportUrl(''); setImportName(''); } },
                  );
                }}
                className="mb-4 flex items-end gap-3 border border-neutral-100 rounded-lg bg-neutral-50 p-4"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">
                    {showImportForm === 'openapi' ? 'OpenAPI' : 'Swagger'} Spec URL or paste below
                  </label>
                  <input
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://api.example.com/openapi.json"
                    className="w-full text-xs border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="space-y-1 w-48">
                  <label className="text-[10px] font-bold uppercase text-neutral-400">Connector Name *</label>
                  <input
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    required
                    placeholder="My API"
                    className="w-full text-xs border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!importName.trim() || importOpenApi.isPending || importSwagger.isPending}
                  className="text-xs font-bold bg-primary-600 text-white rounded px-3 py-1.5 hover:bg-primary-700 disabled:opacity-50 transition"
                >
                  {importOpenApi.isPending || importSwagger.isPending ? 'Importing…' : 'Import'}
                </button>
                <button type="button" onClick={() => setShowImportForm(null)} className="text-xs text-neutral-400 hover:text-neutral-700 px-2">✕</button>
              </form>
            )}

            {isLoading ? (
              <p className="text-center text-xs text-neutral-400 animate-pulse py-8">Loading integrations...</p>
            ) : filteredConnectors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConnectors.map((item) => (
                  <div key={item.id} className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-primary-50 text-primary-600 rounded-md flex items-center justify-center border border-primary-100">
                          <Database className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-neutral-800 block">{item.name}</span>
                            {item.name === 'Webchat Widget' && (
                              <span className="bg-primary-100 text-primary-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Default</span>
                            )}
                          </div>
                          <span className={`text-[10px] block ${HEALTH_TONE[item.healthStatus]}`}>
                            {item.connectorType} • {item.healthStatus.toLowerCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${STATUS_TONE[item.status]}`}>
                          {item.status}
                        </span>
                        <button
                          onClick={() => setExpandedConnectorId((cur) => (cur === item.id ? null : item.id))}
                          className="text-neutral-400 hover:text-primary-600 p-1"
                          aria-label={`Configure ${item.name}`}
                          aria-expanded={expandedConnectorId === item.id}
                        >
                          <Settings className="h-4 w-4" />
                        </button>
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

                    {expandedConnectorId === item.id && (
                      <>
                        <ConfigureConnectorForm connector={item} />
                        <ConnectorHealthPanel connectorId={item.id} />
                        <ConnectorCapabilitiesPanel connectorId={item.id} />
                        <ConnectorInstancesPanel connectorId={item.id} />
                        <ConnectorWebhooks connectorId={item.id} />
                        <ExecutionHistory connectorId={item.id} />
                        <ConnectorAuditPanel connectorId={item.id} />
                      </>
                    )}
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
            catalog), so this is a direct install form rather than a browse list. */}
        {activeTab === 'marketplace' && (
          <InstallConnectorForm onInstalled={() => handleTabChange('installed')} />
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
