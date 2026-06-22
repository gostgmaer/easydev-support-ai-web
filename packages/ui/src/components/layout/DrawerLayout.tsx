import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { panelSizes, type PanelSizeKey } from '@easydev/design-system';
import { IconButton } from '../base/IconButton';
import { cn } from '../../utils';

export interface DrawerLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  side?: 'left' | 'right';
  size?: PanelSizeKey;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function DrawerLayout({
  open,
  onOpenChange,
  title,
  description,
  side = 'right',
  size = 'drawerMd',
  footer,
  children,
}: DrawerLayoutProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-neutral-900/40 transition-opacity data-[state=open]:opacity-100 data-[state=closed]:opacity-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 z-modal flex flex-col bg-background shadow-modal transition-transform duration-200',
            side === 'right' ? 'right-0 data-[state=closed]:translate-x-full' : 'left-0 data-[state=closed]:-translate-x-full',
            'data-[state=open]:translate-x-0',
          )}
          style={{ width: panelSizes[size] }}
        >
          <div className="flex items-start justify-between gap-2 border-b border-border px-5 py-4">
            <div>
              {title && <DialogPrimitive.Title className="text-base font-semibold text-foreground">{title}</DialogPrimitive.Title>}
              {description && (
                <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">{description}</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <IconButton icon={<X className="h-4 w-4" />} label="Close" size="sm" variant="ghost" />
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
