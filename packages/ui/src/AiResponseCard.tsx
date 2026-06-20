import * as React from 'react';
import { Sparkles, Check, Edit2, ShieldAlert, DollarSign } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

interface AiResponseCardProps {
  responseContent: string;
  confidence: number; // e.g. 0.92 (92%)
  executionCost: number; // e.g. 0.0034 ($0.0034)
  onApplyDraft: (content: string) => void;
  onEdit: (content: string) => void;
  onEscalate: () => void;
}

export function AiResponseCard({
  responseContent,
  confidence,
  executionCost,
  onApplyDraft,
  onEdit,
  onEscalate
}: AiResponseCardProps) {
  const confidencePercent = Math.round(confidence * 100);
  const isHighConfidence = confidence >= 0.85;

  return (
    <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50/40 to-cyan-50/40 p-4 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-primary-600 font-semibold text-sm">
          <Sparkles className="h-4.5 w-4.5 animate-pulse text-cyan-500" />
          <span>AI Suggested Reply</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Cost Indicator */}
          <div className="flex items-center gap-0.5 text-xs text-neutral-500 font-medium">
            <DollarSign className="h-3 w-3" />
            <span>{executionCost.toFixed(4)}</span>
          </div>

          {/* Confidence Badge */}
          <Badge variant={isHighConfidence ? 'success' : 'warning'}>
            {confidencePercent}% Match
          </Badge>
        </div>
      </div>

      {/* Suggested Message Body */}
      <div className="text-sm leading-relaxed text-neutral-800 bg-white border border-neutral-100 rounded p-3">
        {responseContent}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          variant="default"
          size="sm"
          onClick={() => onApplyDraft(responseContent)}
          className="flex items-center gap-1.5"
        >
          <Check className="h-4 w-4" />
          <span>Apply Draft</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(responseContent)}
          className="flex items-center gap-1.5"
        >
          <Edit2 className="h-4 w-4" />
          <span>Edit Suggestion</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onEscalate}
          className="flex items-center gap-1.5 text-danger hover:text-danger hover:bg-danger/10"
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Escalate to Human</span>
        </Button>
      </div>
    </div>
  );
}
