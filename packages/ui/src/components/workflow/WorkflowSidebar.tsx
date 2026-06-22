import * as React from 'react';
import { Panel } from '../layout/Panel';
import { NODE_TYPE_ICON, NODE_TYPE_CLASSNAME } from './workflow-style';
import type { WorkflowNodeType } from '../../types/workflow';
import { cn } from '../../utils';

export interface WorkflowNodeTemplate {
  type: WorkflowNodeType;
  title: string;
  description?: string;
}

export interface WorkflowSidebarProps {
  templates: WorkflowNodeTemplate[];
  onAddNode: (template: WorkflowNodeTemplate) => void;
}

export function WorkflowSidebar({ templates, onAddNode }: WorkflowSidebarProps) {
  return (
    <Panel title="Add a step">
      <div className="space-y-2">
        {templates.map((template) => {
          const Icon = NODE_TYPE_ICON[template.type];
          return (
            <button
              key={`${template.type}-${template.title}`}
              type="button"
              onClick={() => onAddNode(template)}
              className={cn('flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left hover:opacity-90', NODE_TYPE_CLASSNAME[template.type])}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>
                <span className="block text-sm font-medium">{template.title}</span>
                {template.description && <span className="block text-xs opacity-80">{template.description}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
