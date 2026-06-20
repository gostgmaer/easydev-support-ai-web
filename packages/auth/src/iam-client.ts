import { ApiClient } from '@easydev/api-client';
import type { AuthTokens, LoginCredentials, Session, TenantSwitchResult, UserProfileUpdate, User } from '@easydev/types';

/**
 * Thin client over the EasyDev IAM service. Refresh tokens travel exclusively
 * as an httpOnly cookie set by IAM on login/refresh - the access token is the
 * only credential the browser JS ever sees, and it is kept in memory only.
 */
export class IamClient {
  constructor(private readonly api: ApiClient) {}

  login(credentials: LoginCredentials): Promise<Session> {
    return this.api.post<Session>('/v1/iam/auth/login', credentials, { skipAuth: true });
  }

  logout(): Promise<void> {
    return this.api.post<void>('/v1/iam/auth/logout');
  }

  /** Exchanges the httpOnly refresh cookie for a fresh access token. */
  refreshTokens(): Promise<AuthTokens> {
    return this.api.post<AuthTokens>('/v1/iam/auth/refresh', undefined, { skipAuth: true, retry: false });
  }

  getSession(): Promise<Session> {
    return this.api.get<Session>('/v1/iam/auth/session');
  }

  switchTenant(tenantId: string): Promise<TenantSwitchResult> {
    return this.api.post<TenantSwitchResult>(`/v1/iam/tenants/${tenantId}/switch`);
  }

  updateProfile(update: UserProfileUpdate): Promise<User> {
    return this.api.patch<User>('/v1/iam/me/profile', update);
  }
}
