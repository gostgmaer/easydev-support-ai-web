import { ApiClient } from '@easydev/api-client';
import { useAuthStore, useTenantStore } from '@easydev/stores';
import { IamClient } from './iam-client';

export interface CreateAuthClientsOptions {
  baseUrl: string;
  onUnauthorized?: () => void;
}

export interface AuthClients {
  apiClient: ApiClient;
  iamClient: IamClient;
}

/**
 * Wires an ApiClient and IamClient together. The ApiClient's refresh callback
 * must call back into the IamClient, and the IamClient is built from the
 * ApiClient - this factory breaks that construction cycle with a forward ref.
 */
export function createAuthClients({ baseUrl, onUnauthorized }: CreateAuthClientsOptions): AuthClients {
  const refreshRef: { current: (() => ReturnType<IamClient['refreshTokens']>) | null } = { current: null };

  const apiClient = new ApiClient({
    baseUrl,
    getAccessToken: () => useAuthStore.getState().tokens?.accessToken ?? null,
    getTenantId: () => useTenantStore.getState().current?.id ?? null,
    refreshTokens: () => {
      if (!refreshRef.current) {
        throw new Error('Auth client not fully initialized yet');
      }
      return refreshRef.current();
    },
    onUnauthorized: () => {
      useAuthStore.getState().clear();
      onUnauthorized?.();
    },
  });

  const iamClient = new IamClient(apiClient);
  refreshRef.current = () => iamClient.refreshTokens();

  return { apiClient, iamClient };
}
