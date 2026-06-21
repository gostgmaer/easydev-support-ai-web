import * as React from 'react';
import { DollarSign } from 'lucide-react';
import { aiCostIndicatorRules } from '@easydev/design-system';
import { Badge } from '../base/Badge';

export interface AiCostBadgeProps {
  cost: number;
}

export function AiCostBadge({ cost }: AiCostBadgeProps) {
  const isExpensive = cost > aiCostIndicatorRules.warnAboveUsd;
  return (
    <Badge tone={isExpensive ? 'warning' : 'neutral'}>
      <DollarSign className="h-3 w-3" />${cost.toFixed(aiCostIndicatorRules.precision)}
    </Badge>
  );
}
