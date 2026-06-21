import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils';

export interface FormSectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
}: FormSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  const header = (
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {collapsible && (
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      )}
    </div>
  );

  if (!collapsible) {
    return (
      <section className={cn('space-y-4 border-b border-border pb-6 last:border-0 last:pb-0', className)}>
        {header}
        <div className="space-y-4">{children}</div>
      </section>
    );
  }

  return (
    <CollapsiblePrimitive.Root
      open={open}
      onOpenChange={setOpen}
      className={cn('space-y-4 border-b border-border pb-6 last:border-0 last:pb-0', className)}
    >
      <CollapsiblePrimitive.Trigger className="w-full text-left">{header}</CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content className="space-y-4">{children}</CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}
