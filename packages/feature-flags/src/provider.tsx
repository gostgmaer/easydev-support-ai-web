'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@easydev/api-client';
import { usePermissionsOptional } from '@easydev/permissions';
import { useFeatureFlagStore, useTenantStore } from '@easydev/stores';
import type { FeatureFlagMap, FeatureFlagValue, PermissionAction, PermissionResource } from '@easydev/types';
import { FeatureFlagClient } from './client';
import { DEFAULT_FLAGS, resolveFlag } from './fallback';

interface FeatureFlagContextValue {
  flags: FeatureFlagMap;
  isLoading: boolean;
  getFlag: (key: string, fallback?: FeatureFlagValue) => FeatureFlagValue;
}

const FeatureFlagContext = React.createContext<FeatureFlagContextValue | null>(null);

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const api = useApiClient();
  const setFlags = useFeatureFlagStore((state) => state.setFlags);
  const client = React.useMemo(() => new FeatureFlagClient(api), [api]);
  const tenantId = useTenantStore((state) => state.current?.id);

  const { data, isLoading } = useQuery({
    // Tenant-scoped: refetches automatically when the active tenant changes
    // (e.g. after switchTenant). Resolves to `undefined` for anonymous callers
    // (e.g. the Customer Widget), which fall back to whatever the API client's
    // own getTenantId() resolves from the embed context.
    queryKey: ['feature-flags', tenantId],
    queryFn: () => client.fetchFlags(),
    staleTime: 60_000,
    retry: 1,
  });

  const flags = data ?? DEFAULT_FLAGS;

  React.useEffect(() => {
    if (data) setFlags(data);
  }, [data, setFlags]);

  const value = React.useMemo<FeatureFlagContextValue>(
    () => ({
      flags,
      isLoading,
      getFlag: (key, fallback) => resolveFlag(flags, key, fallback),
    }),
    [flags, isLoading],
  );

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}

function useFeatureFlagContext(): FeatureFlagContextValue {
  const ctx = React.useContext(FeatureFlagContext);
  if (!ctx) throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  return ctx;
}

export interface UseFeatureFlagOptions {
  fallback?: FeatureFlagValue;
  requiredPermission?: { resource: PermissionResource; action: PermissionAction };
}

/**
 * Resolves a flag value, additionally gating it behind a permission check when configured.
 * Uses the non-throwing permission hook so flag-only consumers (e.g. the anonymous Customer
 * Widget) work without a PermissionProvider mounted. If requiredPermission is set but no
 * PermissionProvider exists, that's a misconfiguration - fail closed (denied) rather than
 * silently ignoring the requirement.
 */
export function useFeatureFlag(key: string, options: UseFeatureFlagOptions = {}): FeatureFlagValue {
  const { getFlag } = useFeatureFlagContext();
  const permissions = usePermissionsOptional();

  if (options.requiredPermission) {
    if (!permissions) return false;
    if (!permissions.can(options.requiredPermission.resource, options.requiredPermission.action)) return false;
  }
  return getFlag(key, options.fallback ?? false);
}

export function useFeatureFlags(): FeatureFlagContextValue {
  return useFeatureFlagContext();
}
