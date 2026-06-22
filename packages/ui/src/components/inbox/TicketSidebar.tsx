import * as React from 'react';
import { Clock } from 'lucide-react';
import { Panel } from '../layout/Panel';
import { Avatar } from '../base/Avatar';
import { Tag } from '../base/Tag';
import { Separator } from '../base/Separator';
import { ConversationStatus } from './ConversationStatus';
import { ConversationPriority } from './ConversationPriority';
import type { ConversationStatusValue, ConversationPriorityValue } from '../../types/inbox';
import { formatRelativeTime } from '../../utils';

export interface TicketDetails {
  id: string;
  number: string;
  status: ConversationStatusValue;
  priority: ConversationPriorityValue;
  assigneeName?: string;
  assigneeAvatarUrl?: string;
  slaDueAt?: string;
  tags?: string[];
}

export interface TicketSidebarProps {
  ticket: TicketDetails;
  onAssigneeClick?: () => void;
  actions?: React.ReactNode;
}

export function TicketSidebar({ ticket, onAssigneeClick, actions }: TicketSidebarProps) {
  return (
    <Panel title={`Ticket #${ticket.number}`} actions={actions}>
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <ConversationStatus status={ticket.status} />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Priority</dt>
          <dd>
            <ConversationPriority priority={ticket.priority} />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Assignee</dt>
          <dd>
            <button type="button" onClick={onAssigneeClick} className="flex items-center gap-2">
              <Avatar name={ticket.assigneeName ?? 'Unassigned'} src={ticket.assigneeAvatarUrl} size="xs" />
              <span className="text-foreground">{ticket.assigneeName ?? 'Unassigned'}</span>
            </button>
          </dd>
        </div>
        {ticket.slaDueAt && (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">SLA due</dt>
            <dd className="flex items-center gap-1 text-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeTime(ticket.slaDueAt)}
            </dd>
          </div>
        )}
      </dl>
      {ticket.tags && ticket.tags.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-1.5">
            {ticket.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}
