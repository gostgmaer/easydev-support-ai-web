import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown, Wrench, Loader2, Check, X } from 'lucide-react';
import { aiToolCallRules } from '@easydev/design-system';
import { Badge } from '../base/Badge';
import type { AiToolCall } from '../../types/ai';
import { cn } from '../../utils';

const STATUS_BADGE: Record<AiToolCall['status'], { tone: 'neutral' | 'info' | 'success' | 'danger'; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { tone: 'neutral', icon: Wrench },
  RUNNING: { tone: 'info', icon: Loader2 },
  SUCCEEDED: { tone: 'success', icon: Check },
  FAILED: { tone: 'danger', icon: X },
};

function truncate(value: string): string {
  return value.length > aiToolCallRules.truncateArgsAfterChars
    ? `${value.slice(0, aiToolCallRules.truncateArgsAfterChars)}…`
    : value;
}

export interface AiToolCallViewerProps {
  toolCall: AiToolCall;
  defaultOpen?: boolean;
}

export function AiToolCallViewer({ toolCall, defaultOpen = false }: AiToolCallViewerProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const status = STATUS_BADGE[toolCall.status];
  const StatusIcon = status.icon;
  const latencyMs = toolCall.completedAt
    ? new Date(toolCall.completedAt).getTime() - new Date(toolCall.startedAt).getTime()
    : undefined;

  return (
    <CollapsiblePrimitive.Root open={open} onOpenChange={setOpen} className="rounded-md border border-border">
      <CollapsiblePrimitive.Trigger className="flex w-full items-center justify-between gap-2 px-3 py-2">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
          {toolCall.toolName}
        </span>
        <span className="flex items-center gap-2">
          {aiToolCallRules.showLatency && latencyMs !== undefined && (
            <span className="text-xs text-muted-foreground">{latencyMs}ms</span>
          )}
          <Badge tone={status.tone}>
            <StatusIcon className={cn('h-3 w-3', toolCall.status === 'RUNNING' && 'animate-spin')} />
            {toolCall.status}
          </Badge>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </span>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content className="border-t border-border px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Input</p>
        <pre className="mt-1 overflow-x-auto rounded-sm bg-neutral-900 p-2 text-xs text-neutral-100">
          {truncate(JSON.stringify(toolCall.input, null, 2))}
        </pre>
        {toolCall.output && (
          <>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Output</p>
            <pre className="mt-1 overflow-x-auto rounded-sm bg-neutral-900 p-2 text-xs text-neutral-100">
              {truncate(JSON.stringify(toolCall.output, null, 2))}
            </pre>
          </>
        )}
        {toolCall.errorMessage && <p className="mt-2 text-xs text-danger">{toolCall.errorMessage}</p>}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}
