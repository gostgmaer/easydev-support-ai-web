import { create } from 'zustand';
import type { AuthTokens, Permission, Session, Tenant, TenantMembership, User } from '@easydev/types';

export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated' | 'refreshing';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  tenant: Tenant | null;
  memberships: TenantMembership[];
  permissions: Permission[];
  tokens: AuthTokens | null;
  setSession: (session: Session) => void;
  setTokens: (tokens: AuthTokens) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
}

const initialState = {
  status: 'idle' as AuthStatus,
  user: null as User | null,
  tenant: null as Tenant | null,
  memberships: [] as TenantMembership[],
  permissions: [] as Permission[],
  tokens: null as AuthTokens | null,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setSession: (session) =>
    set({
      status: 'authenticated',
      user: session.user,
      tenant: session.tenant,
      memberships: session.memberships,
      permissions: session.permissions,
      tokens: session.tokens,
    }),
  setTokens: (tokens) => set({ tokens }),
  setStatus: (status) => set({ status }),
  clear: () => set({ ...initialState, status: 'unauthenticated' }),
}));
