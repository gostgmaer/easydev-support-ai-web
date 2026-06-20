'use client';

import * as React from 'react';
import { ApiProvider } from '@easydev/api-client';
import { useAuthStore, useTenantStore } from '@easydev/stores';
import type { LoginCredentials, UserProfileUpdate } from '@easydev/types';
import { toAppError } from '@easydev/utils';
import { createAuthClients } from './create-auth-clients';
import { IamClient } from './iam-client';

const REFRESH_SAFETY_MARGIN_MS = 60_000;

interface AuthContextValue {
  iamClient: IamClient;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  updateProfile: (update: UserProfileUpdate) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  baseUrl: string;
  onUnauthenticated?: () => void;
}

export function AuthProvider({ children, baseUrl, onUnauthenticated }: AuthProviderProps) {
  const setSession = useAuthStore((state) => state.setSession);
  const setStatus = useAuthStore((state) => state.setStatus);
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearAuth = useAuthStore((state) => state.clear);
  const setTenant = useTenantStore((state) => state.setCurrent);
  const setAvailableTenants = useTenantStore((state) => state.setAvailable);

  const refreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const { apiClient, iamClient } = React.useMemo(
    () =>
      createAuthClients({
        baseUrl,
        onUnauthorized: () => onUnauthenticated?.(),
      }),
    [baseUrl, onUnauthenticated],
  );

  const scheduleRefresh = React.useCallback(
    (expiresAt: number) => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      const delay = Math.max(0, expiresAt - Date.now() - REFRESH_SAFETY_MARGIN_MS);
      refreshTimerRef.current = setTimeout(async () => {
        try {
          const tokens = await iamClient.refreshTokens();
          setTokens(tokens);
          scheduleRefresh(tokens.expiresAt);
        } catch {
          clearAuth();
          onUnauthenticated?.();
        }
      }, delay);
    },
    [iamClient, setTokens, clearAuth, onUnauthenticated],
  );

  React.useEffect(() => {
    let cancelled = false;
    setStatus('authenticating');

    iamClient
      .refreshTokens()
      .then(async (tokens) => {
        if (cancelled) return;
        setTokens(tokens);
        const session = await iamClient.getSession();
        if (cancelled) return;
        setSession(session);
        setTenant(session.tenant);
        setAvailableTenants(session.memberships);
        scheduleRefresh(tokens.expiresAt);
      })
      .catch(() => {
        if (!cancelled) setStatus('unauthenticated');
      });

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iamClient]);

  const login = React.useCallback(
    async (credentials: LoginCredentials) => {
      setStatus('authenticating');
      try {
        const session = await iamClient.login(credentials);
        setSession(session);
        setTenant(session.tenant);
        setAvailableTenants(session.memberships);
        scheduleRefresh(session.tokens.expiresAt);
      } catch (error) {
        setStatus('unauthenticated');
        throw toAppError(error);
      }
    },
    [iamClient, setSession, setStatus, setTenant, setAvailableTenants, scheduleRefresh],
  );

  const logout = React.useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    try {
      await iamClient.logout();
    } finally {
      clearAuth();
    }
  }, [iamClient, clearAuth]);

  const switchTenant = React.useCallback(
    async (tenantId: string) => {
      useTenantStore.getState().setSwitching(true);
      try {
        const result = await iamClient.switchTenant(tenantId);
        setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken, expiresAt: Date.now() + 15 * 60_000 });
        setTenant(result.tenant);
        const session = await iamClient.getSession();
        setSession(session);
        setAvailableTenants(session.memberships);
      } finally {
        useTenantStore.getState().setSwitching(false);
      }
    },
    [iamClient, setTokens, setTenant, setSession, setAvailableTenants],
  );

  const updateProfile = React.useCallback(
    async (update: UserProfileUpdate) => {
      const user = await iamClient.updateProfile(update);
      const current = useAuthStore.getState();
      if (current.user && current.tenant) {
        setSession({
          user,
          tenant: current.tenant,
          memberships: current.memberships,
          permissions: current.permissions,
          tokens: current.tokens!,
        });
      }
    },
    [iamClient, setSession],
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({ iamClient, login, logout, switchTenant, updateProfile }),
    [iamClient, login, logout, switchTenant, updateProfile],
  );

  return (
    <ApiProvider client={apiClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </ApiProvider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');

  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const tenant = useAuthStore((state) => state.tenant);
  const permissions = useAuthStore((state) => state.permissions);

  return {
    status,
    user,
    tenant,
    permissions,
    isAuthenticated: status === 'authenticated',
    login: ctx.login,
    logout: ctx.logout,
    switchTenant: ctx.switchTenant,
    updateProfile: ctx.updateProfile,
  };
}
