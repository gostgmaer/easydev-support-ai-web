export interface Role {
  id: string;
  key: string;
  name: string;
  description?: string;
}

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
