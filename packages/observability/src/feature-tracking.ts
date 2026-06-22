import type { TelemetryClient } from './telemetry-client';
import type { PermissionViolationType } from './types';

export function trackFeatureFlagEvaluation(
  client: TelemetryClient,
  featureKey: string,
  variation: string | boolean,
  context?: Record<string, unknown>
): void {
  client.queueEvent({
    type: 'tenant_analytics',
    tenantUsageMetric: 'feature_toggle',
    featureKey,
    properties: {
      variation,
      ...context,
    },
  });
}

export function trackPermissionDenied(
  client: TelemetryClient,
  requiredPermission: string,
  resourcePath?: string,
  properties?: Record<string, unknown>
): void {
  client.trackPermission({
    violation: 'permission_denied',
    requiredPermission,
    resourcePath,
    properties,
  });
}

export function trackFeatureDisabled(
  client: TelemetryClient,
  featureKey: string,
  resourcePath?: string,
  properties?: Record<string, unknown>
): void {
  client.trackPermission({
    violation: 'feature_disabled',
    featureKey,
    resourcePath,
    properties,
  });
}

export function trackUnauthorizedAccess(
  client: TelemetryClient,
  resourcePath?: string,
  properties?: Record<string, unknown>
): void {
  client.trackPermission({
    violation: 'unauthorized_access',
    resourcePath,
    properties,
  });
}

export function trackTenantAccessViolation(
  client: TelemetryClient,
  violatingTenantId: string,
  expectedTenantId: string,
  properties?: Record<string, unknown>
): void {
  client.trackPermission({
    violation: 'tenant_access_violation',
    properties: {
      ...properties,
      violatingTenantId,
      expectedTenantId,
    },
  });
}
