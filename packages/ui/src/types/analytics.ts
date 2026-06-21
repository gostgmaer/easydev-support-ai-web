export type TrendDirection = 'up' | 'down' | 'flat';

export interface TrendInfo {
  direction: TrendDirection;
  changePercent: number;
  isPositive: boolean;
}

export interface MetricDatum {
  label: string;
  value: number | string;
  trend?: TrendInfo;
  unit?: string;
}

export interface DateRangeValue {
  from: Date;
  to: Date;
}

export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'mtd' | 'qtd' | 'ytd' | 'custom';
