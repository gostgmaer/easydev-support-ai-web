import * as React from 'react';
import { Mail, Phone, Building2, Ticket } from 'lucide-react';
import { Panel } from '../layout/Panel';
import { Avatar } from '../base/Avatar';
import { Tag } from '../base/Tag';
import { Separator } from '../base/Separator';

export interface CustomerProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  tags?: string[];
  openTicketCount?: number;
  totalTicketCount?: number;
}

export interface CustomerSidebarProps {
  customer: CustomerProfile;
  actions?: React.ReactNode;
}

export function CustomerSidebar({ customer, actions }: CustomerSidebarProps) {
  return (
    <Panel title="Customer" actions={actions}>
      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar name={customer.name} src={customer.avatarUrl} size="lg" />
        <div>
          <p className="text-sm font-semibold text-foreground">{customer.name}</p>
          {customer.company && <p className="text-xs text-muted-foreground">{customer.company}</p>}
        </div>
      </div>
      <Separator className="my-4" />
      <dl className="space-y-3 text-sm">
        {customer.email && (
          <div className="flex items-center gap-2 text-foreground">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <dd className="truncate">{customer.email}</dd>
          </div>
        )}
        {customer.phone && (
          <div className="flex items-center gap-2 text-foreground">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <dd>{customer.phone}</dd>
          </div>
        )}
        {customer.company && (
          <div className="flex items-center gap-2 text-foreground">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <dd>{customer.company}</dd>
          </div>
        )}
        {typeof customer.totalTicketCount === 'number' && (
          <div className="flex items-center gap-2 text-foreground">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <dd>
              {customer.openTicketCount ?? 0} open / {customer.totalTicketCount} total tickets
            </dd>
          </div>
        )}
      </dl>
      {customer.tags && customer.tags.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-1.5">
            {customer.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}
