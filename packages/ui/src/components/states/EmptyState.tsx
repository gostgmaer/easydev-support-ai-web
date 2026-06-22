import * as React from 'react';
import { Inbox, Ticket, SearchX, BookOpen, Plug, Workflow, BarChart3, BellOff } from 'lucide-react';
import { Button } from '../base/Button';
import { cn } from '../../utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 px-6 py-12 text-center', className)}>
      {icon && <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</span>}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button type="button" size="sm" className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

type PresetProps = Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string };

export function NoConversationsEmptyState(props: PresetProps) {
  return <EmptyState icon={<Inbox className="h-6 w-6" />} title="No conversations yet" description="New conversations will show up here." {...props} />;
}

export function NoTicketsEmptyState(props: PresetProps) {
  return <EmptyState icon={<Ticket className="h-6 w-6" />} title="No tickets found" description="Tickets matching your filters will appear here." {...props} />;
}

export function NoResultsEmptyState(props: PresetProps) {
  return <EmptyState icon={<SearchX className="h-6 w-6" />} title="No results found" description="Try adjusting your search or filters." {...props} />;
}

export function NoKnowledgeEmptyState(props: PresetProps) {
  return <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No articles yet" description="Published knowledge base articles will appear here." {...props} />;
}

export function NoConnectorsEmptyState(props: PresetProps) {
  return <EmptyState icon={<Plug className="h-6 w-6" />} title="No connectors installed" description="Browse the marketplace to connect your tools." {...props} />;
}

export function NoWorkflowsEmptyState(props: PresetProps) {
  return <EmptyState icon={<Workflow className="h-6 w-6" />} title="No workflows yet" description="Build a workflow to automate repetitive work." {...props} />;
}

export function NoAnalyticsEmptyState(props: PresetProps) {
  return <EmptyState icon={<BarChart3 className="h-6 w-6" />} title="Not enough data yet" description="Analytics will appear once activity is recorded." {...props} />;
}

export function NoNotificationsEmptyState(props: PresetProps) {
  return <EmptyState icon={<BellOff className="h-6 w-6" />} title="You're all caught up" description="New notifications will show up here." {...props} />;
}
