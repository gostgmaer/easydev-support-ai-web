import { QueryClient } from '@tanstack/react-query';
import { ApiClientError } from './errors';

export interface CreateQueryClientOptions {
  onError?: (error: unknown) => void;
}

/** Creates a TanStack Query client with retry/backoff rules tuned for the API client's own errors. */
export function createQueryClient(options: CreateQueryClientOptions = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error instanceof ApiClientError) {
            if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN' || error.code === 'NOT_FOUND') {
              return false;
            }
          }
          return failureCount < 2;
        },
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError: options.onError,
      },
    },
  });
}
