import * as React from 'react';
import { Sparkles, Check, Edit2 } from 'lucide-react';
import { Button } from '../base/Button';
import { AiConfidenceBadge } from './AiConfidenceBadge';
import type { AiSuggestion } from '../../types/ai';
import { cn } from '../../utils';

export interface AiSuggestionCardProps {
  suggestion: AiSuggestion;
  onApply: (suggestion: AiSuggestion) => void;
  onEdit?: (suggestion: AiSuggestion) => void;
  className?: string;
}

export function AiSuggestionCard({ suggestion, onApply, onEdit, className }: AiSuggestionCardProps) {
  return (
    <div className={cn('rounded-md border border-primary/20 bg-primary/5 p-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          {suggestion.title}
        </span>
        <AiConfidenceBadge score={suggestion.confidence} />
      </div>
      <p className="mt-2 text-sm text-foreground">{suggestion.content}</p>
      {suggestion.sourceLabel && <p className="mt-1 text-xs text-muted-foreground">Source: {suggestion.sourceLabel}</p>}
      <div className="mt-3 flex items-center gap-2">
        <Button type="button" size="sm" leadingIcon={<Check className="h-3.5 w-3.5" />} onClick={() => onApply(suggestion)}>
          Apply
        </Button>
        {onEdit && (
          <Button type="button" size="sm" variant="outline" leadingIcon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => onEdit(suggestion)}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
