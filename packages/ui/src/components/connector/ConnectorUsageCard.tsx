import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../layout/Card';
import { Progress } from '../base/Progress';
import type { ConnectorUsageMetric } from '../../types/connector';

export interface ConnectorUsageCardProps {
  title: React.ReactNode;
  metrics: ConnectorUsageMetric[];
}

export function ConnectorUsageCard({ title, metrics }: ConnectorUsageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-foreground">{metric.label}</span>
              <span className="text-muted-foreground">
                {metric.used.toLocaleString()}
                {metric.limit ? ` / ${metric.limit.toLocaleString()}` : ''} {metric.unit}
              </span>
            </div>
            {metric.limit && <Progress value={(metric.used / metric.limit) * 100} />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
