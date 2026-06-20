export type PermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'assign'
  | 'resolve'
  | 'export'
  | 'manage';

export type PermissionResource =
  | 'conversation'
  | 'ticket'
  | 'customer'
  | 'team'
  | 'channel'
  | 'connector'
  | 'knowledge_base'
  | 'workflow'
  | 'ai_agent'
  | 'analytics'
  | 'settings'
  | 'admin_dashboard'
  | 'api_key'
  | 'webhook'
  | 'billing'
  | 'widget';

export interface Permission {
  action: PermissionAction;
  resource: PermissionResource;
  /** Optional scope qualifier, e.g. a team id, restricting the grant. */
  scope?: string;
}

export type PermissionKey = `${PermissionResource}:${PermissionAction}`;

export function permissionKey(resource: PermissionResource, action: PermissionAction): PermissionKey {
  return `${resource}:${action}`;
}
