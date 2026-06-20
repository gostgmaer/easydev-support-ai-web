'use client';

import * as React from 'react';
import type { PermissionAction, PermissionResource } from '@easydev/types';
import { usePermissions } from './provider';

export interface CanProps {
  resource: PermissionResource;
  action: PermissionAction;
  scope?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/** Renders children only if the current session can perform action on resource. */
export function Can({ resource, action, scope, fallback = null, children }: CanProps) {
  const { can } = usePermissions();
  return can(resource, action, scope) ? <>{children}</> : <>{fallback}</>;
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
