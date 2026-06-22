import * as React from 'react';
import type { TelemetryClient } from './telemetry-client';
import type { ErrorSeverity } from './types';

// Global error mapper
export function trackNetworkError(
  client: TelemetryClient,
  url: string,
  method: string,
  status?: number,
  errorMessage?: string,
  requestId?: string
) {
  client.trackError({
    category: 'network',
    severity: status && status >= 500 ? 'fatal' : 'error',
    message: `Network request failed: ${method} ${url} (Status: ${status ?? 'unknown'})`,
    metadata: {
      url,
      method,
      status,
      errorMessage,
      requestId,
    },
  });
}

export function trackApiError(
  client: TelemetryClient,
  endpoint: string,
  errorCode: string,
  message: string,
  status?: number,
  requestId?: string
) {
  client.trackError({
    category: 'api',
    severity: 'error',
    message: `API Error: [${errorCode}] ${message}`,
    metadata: {
      endpoint,
      errorCode,
      status,
      requestId,
    },
  });
}

export function trackPermissionError(
  client: TelemetryClient,
  requiredPermission: string,
  resourcePath?: string
) {
  client.trackError({
    category: 'permission',
    severity: 'warning',
    message: `Permission denied: Missing '${requiredPermission}' for path '${resourcePath ?? 'unknown'}'`,
    metadata: {
      requiredPermission,
      resourcePath,
    },
  });
}

export function trackFeatureFlagError(
  client: TelemetryClient,
  featureKey: string,
  evaluationError: string
) {
  client.trackError({
    category: 'feature_flag',
    severity: 'warning',
    message: `Feature flag evaluation failed for key '${featureKey}': ${evaluationError}`,
    metadata: {
      featureKey,
      evaluationError,
    },
  });
}

export function trackRealtimeError(
  client: TelemetryClient,
  connectionStatus: string,
  reason?: string
) {
  client.trackError({
    category: 'realtime',
    severity: 'error',
    message: `Realtime socket error: Status = ${connectionStatus}. Reason = ${reason ?? 'unknown'}`,
    metadata: {
      connectionStatus,
      reason,
    },
  });
}

// ----------------------------------------------------
// Global Error & Promise Rejection listener hook-up
// ----------------------------------------------------
export function initializeGlobalErrorListeners(client: TelemetryClient): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleErrorEvent = (event: ErrorEvent) => {
    client.trackError({
      category: 'global',
      severity: 'error',
      message: event.message || 'Unknown runtime error',
      stack: event.error?.stack || undefined,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  };

  const handlePromiseRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    let message = 'Unhandled Promise Rejection';
    let stack: string | undefined;
    let metadata: Record<string, unknown> = {};

    if (reason instanceof Error) {
      message = reason.message;
      stack = reason.stack;
    } else if (typeof reason === 'string') {
      message = reason;
    } else if (reason && typeof reason === 'object') {
      message = reason.message || JSON.stringify(reason);
      metadata = { details: reason };
    }

    client.trackError({
      category: 'promise',
      severity: 'error',
      message,
      stack,
      metadata,
    });
  };

  window.addEventListener('error', handleErrorEvent);
  window.addEventListener('unhandledrejection', handlePromiseRejection);

  return () => {
    window.removeEventListener('error', handleErrorEvent);
    window.removeEventListener('unhandledrejection', handlePromiseRejection);
  };
}

import { ObservabilityContext } from './context';

// ----------------------------------------------------
// React Error Boundary Component
// ----------------------------------------------------
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  client?: TelemetryClient;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static override contextType = ObservabilityContext;
  declare context: React.ContextType<typeof ObservabilityContext>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    const telemetryClient = this.props.client ?? this.context?.client;
    if (telemetryClient) {
      telemetryClient.trackError({
        category: 'react_boundary',
        severity: 'fatal',
        message: error.message || 'React render crash',
        stack: error.stack,
        metadata: {
          componentStack: errorInfo.componentStack,
        },
      });
    } else {
      console.error('ErrorBoundary caught error but no TelemetryClient was found in props or context:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-8 text-center bg-background border border-border rounded-xl shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Something went wrong</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            An unexpected application error has occurred. We have logged this diagnostic code for our engineering team.
          </p>
          {this.state.error && (
            <div className="mt-4 w-full max-w-lg rounded-lg border border-border/80 bg-muted/50 p-4 text-left font-mono text-xs text-foreground overflow-auto max-h-[200px]">
              <span className="font-bold text-destructive">{this.state.error.name}: </span>
              {this.state.error.message}
              {this.state.errorInfo?.componentStack && (
                <div className="mt-2 text-[10px] text-muted-foreground whitespace-pre">
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>
          )}
          <div className="mt-6 flex gap-4">
            <button
              onClick={this.handleReset}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
