'use client';

import * as React from 'react';
import { useTenantStore } from '@easydev/stores';
import type { PermissionAction, PermissionResource } from '@easydev/types';
import { usePermissions, type PermissionCheck } from './provider';

export interface PermissionGateProps {
  /** Either a resource/action/scope check or a raw predicate may be supplied. */
  resource?: PermissionResource;
  action?: PermissionAction;
  scope?: string;
  check?: () => boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/** General-purpose render gate: shows children only if the resolved check passes. */
export function PermissionGate({ resource, action, scope, check, fallback = null, children }: PermissionGateProps) {
  const { can } = usePermissions();
  const allowed = check ? check() : resource && action ? can(resource, action, scope) : false;
  return allowed ? <>{children}</> : <>{fallback}</>;
}

export interface CanProps {
  resource: PermissionResource;
  action: PermissionAction;
  scope?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/** Renders children only if the current session can perform action on resource. */
export function Can({ resource, action, scope, fallback = null, children }: CanProps) {
  return (
    <PermissionGate resource={resource} action={action} scope={scope} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export interface RequirePermissionProps extends CanProps {
  onDenied?: () => void;
}

/** Route/section-level guard. Invokes onDenied (e.g. a redirect) when access is denied. */
export function RequirePermission({ onDenied, fallback, ...props }: RequirePermissionProps) {
  const { can } = usePermissions();
  const allowed = can(props.resource, props.action, props.scope);

  React.useEffect(() => {
    if (!allowed) onDenied?.();
  }, [allowed, onDenied]);

  if (!allowed) return <>{fallback ?? null}</>;
  return <>{props.children}</>;
}

export interface RequireAnyPermissionProps {
  checks: PermissionCheck[];
  fallback?: React.ReactNode;
  onDenied?: () => void;
  children: React.ReactNode;
}

/** Route/section-level guard: passes if at least one of the given checks is granted. */
export function RequireAnyPermission({ checks, fallback, onDenied, children }: RequireAnyPermissionProps) {
  const { canAny } = usePermissions();
  const allowed = canAny(checks);

  React.useEffect(() => {
    if (!allowed) onDenied?.();
  }, [allowed, onDenied]);

  if (!allowed) return <>{fallback ?? null}</>;
  return <>{children}</>;
}

export interface RequireAllPermissionsProps {
  checks: PermissionCheck[];
  fallback?: React.ReactNode;
  onDenied?: () => void;
  children: React.ReactNode;
}

/** Route/section-level guard: passes only if every given check is granted. */
export function RequireAllPermissions({ checks, fallback, onDenied, children }: RequireAllPermissionsProps) {
  const { canAll } = usePermissions();
  const allowed = canAll(checks);

  React.useEffect(() => {
    if (!allowed) onDenied?.();
  }, [allowed, onDenied]);

  if (!allowed) return <>{fallback ?? null}</>;
  return <>{children}</>;
}

export interface RequireTenantProps {
  /** Tenant ids or slugs allowed to view the content. */
  allow: string[];
  fallback?: React.ReactNode;
  onDenied?: () => void;
  children: React.ReactNode;
}

/** Route/section-level guard: gates content on the active tenant's id or slug. */
export function RequireTenant({ allow, fallback, onDenied, children }: RequireTenantProps) {
  const tenant = useTenantStore((state) => state.current);
  const allowed = !!tenant && (allow.includes(tenant.id) || allow.includes(tenant.slug));

  React.useEffect(() => {
    if (!allowed) onDenied?.();
  }, [allowed, onDenied]);

  if (!allowed) return <>{fallback ?? null}</>;
  return <>{children}</>;
}

/** Action guard: wraps an event handler so it only runs when the permission check passes. */
export function withPermissionGuard<TArgs extends unknown[]>(
  handler: (...args: TArgs) => void,
  check: () => boolean,
  onDenied?: () => void,
): (...args: TArgs) => void {
  return (...args: TArgs) => {
    if (!check()) {
      onDenied?.();
      return;
    }
    handler(...args);
  };
}
