import { AppError, type AppErrorCode } from '@easydev/utils';
import type { ApiError, ApiFieldError } from '@easydev/types';

export class ApiClientError extends AppError {
  public readonly fieldErrors?: ApiFieldError[];

  constructor(apiError: ApiError) {
    super(apiError.message, { code: apiError.code, status: apiError.status, requestId: apiError.requestId });
    this.name = 'ApiClientError';
    this.fieldErrors = apiError.fieldErrors;
  }
}

function codeForStatus(status: number): AppErrorCode {
  switch (status) {
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'RATE_LIMITED';
    case 408:
      return 'TIMEOUT';
    default:
      return status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR';
  }
}

/** Normalizes a failed HTTP response (or network failure) into an ApiClientError. */
export async function mapHttpError(response: Response, requestId?: string): Promise<ApiClientError> {
  let body: any = null;
  try {
    body = await response.clone().json();
  } catch {
    /* non-JSON error body */
  }

  const code = (body?.code as AppErrorCode) || codeForStatus(response.status);
  const message = body?.message || response.statusText || 'Request failed';
  const fieldErrors: ApiFieldError[] | undefined = Array.isArray(body?.errors)
    ? body.errors
    : Array.isArray(body?.fieldErrors)
      ? body.fieldErrors
      : undefined;

  return new ApiClientError({
    code,
    message,
    status: response.status,
    requestId: requestId ?? body?.requestId,
    fieldErrors,
    details: body,
  });
}

export function mapNetworkError(error: unknown, requestId?: string): ApiClientError {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiClientError({ code: 'TIMEOUT', message: 'Request timed out', status: 0, requestId });
  }
  const message = error instanceof Error ? error.message : 'Network request failed';
  return new ApiClientError({ code: 'NETWORK_ERROR', message, status: 0, requestId });
}
