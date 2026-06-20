'use client';

import * as React from 'react';
import { useAuthStore } from '@easydev/stores';
import type { Permission, PermissionAction, PermissionResource } from '@easydev/types';
import { can, canAll, canAny } from './can';
import { PermissionCache } from './cache';

interface PermissionContextValue {
  permissions: Permission[];
  can: (resource: PermissionResource, action: PermissionAction, scope?: string) => boolean;
  canAny: typeof canAny;
  canAll: typeof canAll;
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

export function usePermission(resource: PermissionResource, action: PermissionAction, scope?: string): boolean {
  return usePermissions().can(resource, action, scope);
}
