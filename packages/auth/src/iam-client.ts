import { ApiClient } from '@easydev/api-client';
import type {
  ActiveSession,
  AuthTokens,
  ForgotPasswordPayload,
  LoginCredentials,
  PasswordChangePayload,
  Permission,
  ResetPasswordPayload,
  Session,
  TenantMembership,
  TenantSwitchResult,
  UserProfile,
  UserProfileUpdate,
  User,
} from '@easydev/types';

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

  /** Cheap liveness check for route guards / multi-tab resync; never throws. */
  async validateSession(): Promise<boolean> {
    try {
      await this.getSession();
      return true;
    } catch {
      return false;
    }
  }

  switchTenant(tenantId: string): Promise<TenantSwitchResult> {
    return this.api.post<TenantSwitchResult>(`/v1/iam/tenants/${tenantId}/switch`);
  }

  getProfile(): Promise<UserProfile> {
    return this.api.get<UserProfile>('/v1/iam/me/profile');
  }

  updateProfile(update: UserProfileUpdate): Promise<User> {
    return this.api.patch<User>('/v1/iam/me/profile', update);
  }

  getPermissions(): Promise<Permission[]> {
    return this.api.get<Permission[]>('/v1/iam/me/permissions');
  }

  getTenants(): Promise<TenantMembership[]> {
    return this.api.get<TenantMembership[]>('/v1/iam/me/tenants');
  }

  changePassword(payload: PasswordChangePayload): Promise<void> {
    return this.api.post<void>('/v1/iam/me/password/change', payload);
  }

  forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    return this.api.post<void>('/v1/iam/auth/password/forgot', payload, { skipAuth: true });
  }

  resetPassword(payload: ResetPasswordPayload): Promise<void> {
    return this.api.post<void>('/v1/iam/auth/password/reset', payload, { skipAuth: true });
  }

  listSessions(): Promise<ActiveSession[]> {
    return this.api.get<ActiveSession[]>('/v1/iam/me/sessions');
  }

  revokeSession(sessionId: string): Promise<void> {
    return this.api.delete<void>(`/v1/iam/me/sessions/${sessionId}`);
  }
}
