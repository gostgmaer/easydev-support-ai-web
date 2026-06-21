import * as React from 'react';
import { WorkflowNode } from './WorkflowNode';
import type { WorkflowNodeData, WorkflowEdgeData } from '../../types/workflow';
import { cn } from '../../utils';

export interface WorkflowCanvasProps {
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
  selectedNodeId?: string;
  onNodeSelect?: (node: WorkflowNodeData) => void;
  onNodePositionChange?: (nodeId: string, position: { x: number; y: number }) => void;
  width?: number;
  height?: number;
  className?: string;
}

function nodeCenter(node: WorkflowNodeData): { x: number; y: number } {
  return { x: node.position.x + 96, y: node.position.y + 30 };
}

export function WorkflowCanvas({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect,
  onNodePositionChange,
  width = 1600,
  height = 1000,
  className,
}: WorkflowCanvasProps) {
  const nodesById = React.useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  return (
    <div className={cn('relative overflow-auto rounded-md border border-border bg-muted/30', className)}>
      <div className="relative" style={{ width, height }}>
        <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
          {edges.map((edge) => {
            const source = nodesById.get(edge.sourceId);
            const target = nodesById.get(edge.targetId);
            if (!source || !target) return null;
            const from = nodeCenter(source);
            const to = nodeCenter(target);
            return (
              <line
                key={edge.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="currentColor"
                className="text-border"
                strokeWidth={2}
                markerEnd="url(#workflow-arrow)"
              />
            );
          })}
          <defs>
            <marker id="workflow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-border" />
            </marker>
          </defs>
        </svg>
        {nodes.map((node) => (
          <WorkflowNode
            key={node.id}
            node={node}
            selected={node.id === selectedNodeId}
            onSelect={onNodeSelect}
            onPositionChange={onNodePositionChange}
          />
        ))}
      </div>
    </div>
  );
}
