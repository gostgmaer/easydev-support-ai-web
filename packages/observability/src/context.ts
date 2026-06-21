import * as React from 'react';
import type { TelemetryClient } from './telemetry-client';
import type { PerformanceTracker } from './performance-tracking';

export const ObservabilityContext = React.createContext<{
  client: TelemetryClient;
  performanceTracker: PerformanceTracker;
} | null>(null);
