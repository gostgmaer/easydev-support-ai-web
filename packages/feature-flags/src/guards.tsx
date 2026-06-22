'use client';

import * as React from 'react';
import type { FeatureFlagValue, PermissionAction, PermissionResource } from '@easydev/types';
import { useFeatureFlag } from './provider';

interface FeatureFlagCheckProps {
  flag: string;
  /** When set, the flag's resolved value must equal this to pass (defaults to truthy). */
  is?: FeatureFlagValue;
  requiredPermission?: { resource: PermissionResource; action: PermissionAction };
}

export interface FeatureFlagGateProps extends FeatureFlagCheckProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/** Renders children only if the flag resolves to a truthy value (or matches `is`). */
export function FeatureFlagGate({ flag, is, requiredPermission, fallback = null, children }: FeatureFlagGateProps) {
  const value = useFeatureFlag(flag, { requiredPermission });
  const enabled = is === undefined ? Boolean(value) : value === is;
  return enabled ? <>{children}</> : <>{fallback}</>;
}

export interface RequireFeatureFlagProps extends FeatureFlagCheckProps {
  fallback?: React.ReactNode;
  onDenied?: () => void;
  children: React.ReactNode;
}

/** Route/section-level guard. Invokes onDenied (e.g. a redirect) when the flag is disabled. */
export function RequireFeatureFlag({ flag, is, requiredPermission, fallback, onDenied, children }: RequireFeatureFlagProps) {
  const value = useFeatureFlag(flag, { requiredPermission });
  const enabled = is === undefined ? Boolean(value) : value === is;

  React.useEffect(() => {
    if (!enabled) onDenied?.();
  }, [enabled, onDenied]);

  if (!enabled) return <>{fallback ?? null}</>;
  return <>{children}</>;
}
