import type { User } from './user';
import type { Tenant, TenantMembership } from './tenant';
import type { Permission } from './permission';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds the access token expires at. */
  expiresAt: number;
}

export interface Session {
  user: User;
  tenant: Tenant;
  memberships: TenantMembership[];
  permissions: Permission[];
  tokens: AuthTokens;
}

export type SsoProviderKey = 'google' | 'microsoft' | 'okta' | 'saml';

export interface SsoProviderConfig {
  key: SsoProviderKey;
  authorizationUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenantSlug?: string;
}
