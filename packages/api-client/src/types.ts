import type { AuthTokens } from '@easydev/types';
import type { RetryOptions } from '@easydev/utils';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => string | null;
  getTenantId?: () => string | null;
  refreshTokens?: () => Promise<AuthTokens>;
  onUnauthorized?: () => void;
  defaultTimeoutMs?: number;
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  timeoutMs?: number;
  skipAuth?: boolean;
  retry?: RetryOptions | false;
}
