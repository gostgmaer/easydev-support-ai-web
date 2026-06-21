'use client';

import * as React from 'react';
import { useTenantStore } from '@easydev/stores';
import { focusRingClassName } from '@easydev/design-system';
import { useAuth } from './auth-provider';

export interface TenantSelectorProps {
  onSwitched?: () => void;
}

/** Lists the memberships available to the current user and lets them switch the active tenant. */
export function TenantSelector({ onSwitched }: TenantSelectorProps) {
  const { switchTenant } = useAuth();
  const memberships = useTenantStore((state) => state.available);
  const current = useTenantStore((state) => state.current);
  const switching = useTenantStore((state) => state.switching);
  const [error, setError] = React.useState<string | null>(null);

  const handleSelect = async (tenantId: string) => {
    if (tenantId === current?.id) return;
    setError(null);
    try {
      await switchTenant(tenantId);
      onSwitched?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not switch organization');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
        <h1 className="text-2xl font-semibold tracking-tight">Choose an organization</h1>

        <ul className="space-y-2" role="listbox" aria-label="Organizations">
          {memberships.map((membership) => {
            const isCurrent = membership.tenant.id === current?.id;
            return (
              <li key={membership.tenant.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  disabled={switching}
                  onClick={() => handleSelect(membership.tenant.id)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-50 ${focusRingClassName} ${
                    isCurrent
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-neutral-200 hover:bg-neutral-100 dark:border-neutral-800'
                  }`}
                >
                  <span className="font-medium">{membership.tenant.name}</span>
                  {isCurrent && <span className="text-xs font-semibold uppercase tracking-wider">Current</span>}
                </button>
              </li>
            );
          })}
        </ul>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
