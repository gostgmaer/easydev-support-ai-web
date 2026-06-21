import * as React from 'react';
import type { WorkflowNodeData } from '../../types/workflow';
import { NODE_TYPE_ICON, NODE_TYPE_CLASSNAME, NODE_STATUS_RING } from './workflow-style';
import { cn } from '../../utils';

export interface WorkflowNodeProps {
  node: WorkflowNodeData;
  selected?: boolean;
  onSelect?: (node: WorkflowNodeData) => void;
  onPositionChange?: (nodeId: string, position: { x: number; y: number }) => void;
}

export function WorkflowNode({ node, selected = false, onSelect, onPositionChange }: WorkflowNodeProps) {
  const dragState = React.useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const Icon = NODE_TYPE_ICON[node.type];

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!onPositionChange) return;
    dragState.current = { pointerId: event.pointerId, offsetX: event.clientX - node.position.x, offsetY: event.clientY - node.position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId || !onPositionChange) return;
    onPositionChange(node.id, {
      x: event.clientX - dragState.current.offsetX,
      y: event.clientY - dragState.current.offsetY,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId === event.pointerId) dragState.current = null;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(node)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ left: node.position.x, top: node.position.y }}
      className={cn(
        'absolute flex w-48 cursor-grab select-none flex-col gap-1 rounded-md border bg-background p-3 shadow-sm',
        NODE_TYPE_CLASSNAME[node.type],
        NODE_STATUS_RING[node.status],
        selected && 'ring-2 ring-primary',
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate text-sm font-medium text-foreground">{node.title}</span>
      </div>
      {node.description && <p className="truncate text-xs text-muted-foreground">{node.description}</p>}
    </div>
  );
}
