import * as React from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/** Renders a component wrapped in a fresh, retry-disabled QueryClientProvider for deterministic tests. */
export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient, ...options }: RenderWithProvidersOptions = {},
): RenderResult & { queryClient: QueryClient } {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient: client };
}
