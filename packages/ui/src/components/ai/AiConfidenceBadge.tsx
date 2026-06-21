import * as React from 'react';
import { aiConfidenceRules, resolveAiConfidenceLevel } from '@easydev/design-system';
import { Badge } from '../base/Badge';

export interface AiConfidenceBadgeProps {
  score: number;
}

export function AiConfidenceBadge({ score }: AiConfidenceBadgeProps) {
  const level = resolveAiConfidenceLevel(score);
  const tone = aiConfidenceRules.colorMap[level] as 'success' | 'warning' | 'danger';
  return <Badge tone={tone}>{Math.round(score * 100)}% confidence</Badge>;
}
