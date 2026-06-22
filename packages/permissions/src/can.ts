import type { Permission, PermissionAction, PermissionResource } from '@easydev/types';

/**
 * Checks whether a permission set grants `action` on `resource`, optionally
 * scoped (e.g. to a team id). A permission with no scope is treated as global
 * for that resource/action and satisfies any requested scope.
 */
export function can(
  permissions: Permission[],
  resource: PermissionResource,
  action: PermissionAction,
  scope?: string,
): boolean {
  return permissions.some((permission) => {
    if (permission.resource !== resource) return false;
    if (permission.action !== action && permission.action !== 'manage') return false;
    if (!permission.scope) return true;
    return permission.scope === scope;
  });
}

export function canAny(
  permissions: Permission[],
  checks: Array<{ resource: PermissionResource; action: PermissionAction; scope?: string }>,
): boolean {
  return checks.some((check) => can(permissions, check.resource, check.action, check.scope));
}

export function canAll(
  permissions: Permission[],
  checks: Array<{ resource: PermissionResource; action: PermissionAction; scope?: string }>,
): boolean {
  return checks.every((check) => can(permissions, check.resource, check.action, check.scope));
}
