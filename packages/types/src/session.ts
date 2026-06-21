import type { User } from './user';
import type { Tenant, TenantMembership } from './tenant';
import type { Permission } from './permission';

/** Short-lived bearer credential, kept in memory only - never persisted to storage. */
export type AccessToken = string;
/** Long-lived rotation credential. Travels exclusively as an httpOnly cookie set by IAM. */
export type RefreshToken = string;

export interface AuthTokens {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
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

/** A device/browser session the current user is (or was) signed in from. */
export interface ActiveSession {
  id: string;
  device: string;
  userAgent: string;
  ip: string;
  location?: string;
  createdAt: string;
  lastActiveAt: string;
  /** Whether this entry represents the session making the request. */
  current: boolean;
}

export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
  tenantSlug?: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
