'use client';

import * as React from 'react';
import { useAuthStore, useTenantStore } from '@easydev/stores';
import type { Permission, PermissionAction, PermissionResource } from '@easydev/types';
import { can, canAll, canAny } from './can';
import { PermissionCache } from './cache';

export type PermissionCheck = { resource: PermissionResource; action: PermissionAction; scope?: string };
/** canAny/canAll on the context are bound to the current permission set, so callers only pass `checks`. */
type BoundPermissionListCheck = (checks: PermissionCheck[]) => boolean;

interface PermissionContextValue {
  permissions: Permission[];
  can: (resource: PermissionResource, action: PermissionAction, scope?: string) => boolean;
  canAny: BoundPermissionListCheck;
  canAll: BoundPermissionListCheck;
}

const PermissionContext = React.createContext<PermissionContextValue | null>(null);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const permissions = useAuthStore((state) => state.permissions);
  const cacheRef = React.useRef(new PermissionCache());

  React.useEffect(() => {
    cacheRef.current.invalidate();
  }, [permissions]);

  const value = React.useMemo<PermissionContextValue>(
    () => ({
      permissions,
      can: (resource, action, scope) =>
        cacheRef.current.getOrCompute(`${resource}:${action}:${scope ?? ''}`, () =>
          can(permissions, resource, action, scope),
        ),
      canAny: (checks) => canAny(permissions, checks),
      canAll: (checks) => canAll(permissions, checks),
    }),
    [permissions],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions(): PermissionContextValue {
  const ctx = React.useContext(PermissionContext);
  if (!ctx) throw new Error('usePermissions must be used within a PermissionProvider');
  return ctx;
}

/**
 * Non-throwing variant of usePermissions, for code paths that may run without a
 * PermissionProvider mounted (e.g. the anonymous Customer Widget consuming
 * @easydev/feature-flags, which must not hard-depend on permissions being present).
 */
export function usePermissionsOptional(): PermissionContextValue | null {
  return React.useContext(PermissionContext);
}

export function usePermission(resource: PermissionResource, action: PermissionAction, scope?: string): boolean {
  return usePermissions().can(resource, action, scope);
}

/** Alias of usePermission, matching the canonical hook name used across the app shells. */
export function useHasPermission(resource: PermissionResource, action: PermissionAction, scope?: string): boolean {
  return usePermissions().can(resource, action, scope);
}

export function useHasAnyPermission(checks: PermissionCheck[]): boolean {
  return usePermissions().canAny(checks);
}

export function useHasAllPermissions(checks: PermissionCheck[]): boolean {
  return usePermissions().canAll(checks);
}

export interface TenantPermissionsValue {
  tenantId: string | null;
  permissions: Permission[];
  can: (resource: PermissionResource, action: PermissionAction, scope?: string) => boolean;
  canAny: BoundPermissionListCheck;
  canAll: BoundPermissionListCheck;
}

/**
 * Tenant-scoped view over the current permission set. Permissions are already
 * re-fetched into the same auth store on every tenant switch (see @easydev/auth's
 * switchTenant), so this is a derived convenience wrapper, not a second source of truth.
 */
export function useTenantPermissions(): TenantPermissionsValue {
  const tenantId = useTenantStore((state) => state.current?.id ?? null);
  const ctx = usePermissions();
  return { tenantId, permissions: ctx.permissions, can: ctx.can, canAny: ctx.canAny, canAll: ctx.canAll };
}
