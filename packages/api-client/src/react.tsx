'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClient } from './http-client';
import { createQueryClient } from './query-client';
import type { ApiClientConfig } from './types';

const ApiClientContext = React.createContext<ApiClient | null>(null);

export interface ApiProviderProps {
  children: React.ReactNode;
  /** A pre-built ApiClient instance. Use this when another package (e.g. @easydev/auth) owns construction. */
  client?: ApiClient;
  /** Convenience: builds the ApiClient internally when no pre-built instance is supplied. */
  config?: ApiClientConfig;
  queryClient?: QueryClient;
}

/** Composes the ApiClient instance and a TanStack QueryClientProvider in one wrapper. */
export function ApiProvider({ children, client, config, queryClient }: ApiProviderProps) {
  const builtClient = React.useMemo(() => client ?? new ApiClient(config!), [client, config]);
  const [internalQueryClient] = React.useState(() => queryClient ?? createQueryClient());

  return (
    <ApiClientContext.Provider value={builtClient}>
      <QueryClientProvider client={internalQueryClient}>{children}</QueryClientProvider>
    </ApiClientContext.Provider>
  );
}

export function useApiClient(): ApiClient {
  const client = React.useContext(ApiClientContext);
  if (!client) throw new Error('useApiClient must be used within an ApiProvider');
  return client;
}
