import * as React from 'react';
import { Sparkles, Check, Edit2, ShieldAlert } from 'lucide-react';
import { Button } from '../base/Button';
import { AiConfidenceBadge } from './AiConfidenceBadge';
import { AiCostBadge } from './AiCostBadge';
import { cn } from '../../utils';

export interface AiResponseCardProps {
  responseContent: string;
  confidence: number;
  executionCost: number;
  onApplyDraft: (content: string) => void;
  onEdit: (content: string) => void;
  onEscalate: () => void;
  className?: string;
}

export function AiResponseCard({
  responseContent,
  confidence,
  executionCost,
  onApplyDraft,
  onEdit,
  onEscalate,
  className,
}: AiResponseCardProps) {
  return (
    <div className={cn('rounded-md border border-primary/20 bg-primary/5 p-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI-drafted response
        </span>
        <div className="flex items-center gap-1.5">
          <AiConfidenceBadge score={confidence} />
          <AiCostBadge cost={executionCost} />
        </div>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{responseContent}</p>
      <div className="mt-3 flex items-center gap-2">
        <Button type="button" size="sm" leadingIcon={<Check className="h-3.5 w-3.5" />} onClick={() => onApplyDraft(responseContent)}>
          Apply draft
        </Button>
        <Button type="button" size="sm" variant="outline" leadingIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => onEdit(responseContent)}>
          Edit
        </Button>
        <Button type="button" size="sm" variant="ghost" leadingIcon={<ShieldAlert className="h-3.5 w-3.5" />} onClick={onEscalate}>
          Escalate
        </Button>
      </div>
    </div>
  );
}
