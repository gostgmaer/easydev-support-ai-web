export type AppErrorCode =
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

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly status?: number;
  public readonly requestId?: string;
  public override readonly cause?: unknown;

  constructor(
    message: string,
    options: { code?: AppErrorCode; status?: number; requestId?: string; cause?: unknown } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.code = options.code ?? 'UNKNOWN_ERROR';
    this.status = options.status;
    this.requestId = options.requestId;
    this.cause = options.cause;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof Error) {
    return new AppError(error.message, { code: 'UNKNOWN_ERROR', cause: error });
  }
  return new AppError(typeof error === 'string' ? error : 'An unknown error occurred', {
    code: 'UNKNOWN_ERROR',
    cause: error,
  });
}

export type GlobalErrorHandler = (error: AppError, context: { source: 'window' | 'promise' }) => void;

/**
 * Registers window-level error and unhandled-rejection listeners and funnels
 * them through a single handler. Returns a cleanup function.
 */
export function registerGlobalErrorHandlers(handler: GlobalErrorHandler): () => void {
  if (typeof window === 'undefined') return () => {};

  const onError = (event: ErrorEvent) => {
    handler(toAppError(event.error ?? event.message), { source: 'window' });
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    handler(toAppError(event.reason), { source: 'promise' });
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}
