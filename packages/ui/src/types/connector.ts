export type ConnectorHealthStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNCONFIGURED';

export interface ConnectorSummary {
  id: string;
  name: string;
  category: string;
  iconUrl?: string;
  health: ConnectorHealthStatus;
  isInstalled: boolean;
  description?: string;
}

export interface ConnectorLogEntry {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

export interface ConnectorUsageMetric {
  label: string;
  used: number;
  limit?: number;
  unit?: string;
}

export interface ConnectorSetupStep {
  id: string;
  title: string;
  description?: string;
  isComplete: boolean;
}
