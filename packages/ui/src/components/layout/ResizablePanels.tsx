import * as React from 'react';
import { Panel, PanelGroup, PanelResizeHandle, type PanelGroupProps } from 'react-resizable-panels';
import { cn } from '../../utils';

export const ResizablePanelGroup = ({ className, ...props }: PanelGroupProps) => (
  <PanelGroup className={cn('flex h-full w-full', className)} {...props} />
);

export const ResizablePanel = Panel;

export function ResizableHandle({ withHandle = true }: { withHandle?: boolean }) {
  return (
    <PanelResizeHandle className="group relative flex w-px shrink-0 items-center justify-center bg-border data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full">
      {withHandle && (
        <span className="z-10 flex h-8 w-3 items-center justify-center rounded-sm border border-border bg-background group-data-[panel-group-direction=vertical]:h-3 group-data-[panel-group-direction=vertical]:w-8">
          <span className="h-3 w-px bg-muted-foreground group-data-[panel-group-direction=vertical]:h-px group-data-[panel-group-direction=vertical]:w-3" />
        </span>
      )}
    </PanelResizeHandle>
  );
}
