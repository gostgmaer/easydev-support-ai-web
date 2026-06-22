import * as React from 'react';
import { workspaceLayoutSizes } from '@easydev/design-system';
import { cn } from '../../utils';

export interface WorkspaceLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  listPane: React.ReactNode;
  detailPane: React.ReactNode;
  contextPane?: React.ReactNode;
}

export function WorkspaceLayout({ listPane, detailPane, contextPane, className, ...props }: WorkspaceLayoutProps) {
  return (
    <div className={cn('flex h-full min-h-0 w-full', className)} {...props}>
      <div
        className="flex h-full min-h-0 shrink-0 flex-col overflow-y-auto border-r border-border"
        style={{ width: workspaceLayoutSizes.listPane }}
      >
        {listPane}
      </div>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto" style={{ minWidth: workspaceLayoutSizes.detailPaneMin }}>
        {detailPane}
      </div>
      {contextPane && (
        <div
          className="flex h-full min-h-0 shrink-0 flex-col overflow-y-auto border-l border-border"
          style={{ width: workspaceLayoutSizes.contextPanel }}
        >
          {contextPane}
        </div>
      )}
    </div>
  );
}
