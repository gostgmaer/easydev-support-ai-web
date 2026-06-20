export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  status: number;
  requestId?: string;
  fieldErrors?: ApiFieldError[];
  details?: unknown;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}
