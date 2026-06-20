import { generateRequestId, retry, type RetryOptions } from '@easydev/utils';
import type { AuthTokens } from '@easydev/types';
import { mapHttpError, mapNetworkError, ApiClientError } from './errors';
import type { ApiClientConfig, HttpMethod, RequestOptions } from './types';

const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const IDEMPOTENT_METHODS = new Set<HttpMethod>(['GET']);

const DEFAULT_RETRY: RetryOptions = {
  attempts: 3,
  baseDelayMs: 300,
  maxDelayMs: 4000,
};

export class ApiClient {
  private accessTokenOverride: string | null = null;
  private refreshPromise: Promise<AuthTokens> | null = null;

  constructor(private readonly config: ApiClientConfig) {}

  private buildUrl(path: string, query?: RequestOptions['query']): string {
    const url = new URL(path.replace(/^\//, ''), this.config.baseUrl.replace(/\/?$/, '/'));
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private getAccessToken(): string | null {
    return this.accessTokenOverride ?? this.config.getAccessToken?.() ?? null;
  }

  private async buildHeaders(options: RequestOptions, requestId: string): Promise<Headers> {
    const headers = new Headers(this.config.defaultHeaders);
    headers.set('Accept', 'application/json');
    headers.set('X-Request-Id', requestId);
    headers.set('X-Trace-Id', requestId);

    const tenantId = this.config.getTenantId?.();
    if (tenantId) headers.set('X-Tenant-Id', tenantId);

    if (!options.skipAuth) {
      const token = this.getAccessToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.body !== undefined && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    for (const [key, value] of Object.entries(options.headers ?? {})) {
      headers.set(key, value);
    }
    return headers;
  }

  private async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.config.refreshTokens) {
      throw new ApiClientError({ code: 'UNAUTHORIZED', message: 'Session expired', status: 401 });
    }
    if (!this.refreshPromise) {
      this.refreshPromise = this.config.refreshTokens()
        .then((tokens) => {
          this.accessTokenOverride = tokens.accessToken;
          return tokens;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }
    return this.refreshPromise;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const requestId = generateRequestId();
    const method = options.method ?? 'GET';
    const timeoutMs = options.timeoutMs ?? this.config.defaultTimeoutMs ?? 30_000;
    const retryOptions = options.retry === false ? { attempts: 1 } : { ...DEFAULT_RETRY, ...options.retry };

    const executeOnce = async (allowRefresh: boolean): Promise<T> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      if (options.signal) {
        options.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }

      try {
        const headers = await this.buildHeaders(options, requestId);
        const response = await fetch(this.buildUrl(path, options.query), {
          method,
          headers,
          body:
            options.body === undefined
              ? undefined
              : options.body instanceof FormData
                ? options.body
                : JSON.stringify(options.body),
          signal: controller.signal,
          credentials: 'include',
        });

        if (response.status === 401 && allowRefresh && !options.skipAuth && this.config.refreshTokens) {
          await this.refreshAccessToken();
          return executeOnce(false);
        }

        if (response.status === 401) {
          this.config.onUnauthorized?.();
        }

        if (!response.ok) {
          throw await mapHttpError(response, requestId);
        }

        if (response.status === 204) return undefined as T;
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          return (await response.json()) as T;
        }
        return (await response.text()) as unknown as T;
      } catch (error) {
        if (error instanceof ApiClientError) throw error;
        throw mapNetworkError(error, requestId);
      } finally {
        clearTimeout(timeout);
      }
    };

    return retry(() => executeOnce(true), {
      ...retryOptions,
      shouldRetry: (error) => {
        if (!IDEMPOTENT_METHODS.has(method)) return false;
        if (!(error instanceof ApiClientError)) return true;
        return RETRYABLE_STATUSES.has(error.status ?? 0);
      },
    });
  }

  get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }
  delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  resolveUrl(path: string, query?: RequestOptions['query']): string {
    return this.buildUrl(path, query);
  }
}
