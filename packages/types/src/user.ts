export interface Role {
  id: string;
  key: string;
  name: string;
  description?: string;
}

/** Lightweight pointer to a role, as embedded in tenant memberships and permission grants. */
export type RoleReference = Role;

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: Role[];
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';
  createdAt: string;
  updatedAt: string;
}

export interface AgentProfile {
  id: string;
  userId: string;
  tenantId: string;
  teamIds: string[];
  presenceStatus: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';
  maxConcurrentConversations: number;
}

export interface UserProfileUpdate {
  displayName?: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
}

/** Full profile view-model for account-management pages; richer than the session-embedded User. */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  phone?: string;
  locale: string;
  timezone: string;
  mfaEnabled: boolean;
  roles: RoleReference[];
  createdAt: string;
  updatedAt: string;
}
