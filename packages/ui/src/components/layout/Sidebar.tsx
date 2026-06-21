import * as React from 'react';
import { sidebarWidths, type SidebarWidthKey } from '@easydev/design-system';
import { cn } from '../../utils';

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  width?: SidebarWidthKey;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sidebar({ collapsed = false, width = 'default', header, footer, className, children, style, ...props }: SidebarProps) {
  const resolvedWidth = collapsed ? sidebarWidths.collapsed : sidebarWidths[width];

  return (
    <aside
      className={cn('flex h-full flex-col border-r border-border bg-background transition-[width] duration-200', className)}
      style={{ width: resolvedWidth, ...style }}
      {...props}
    >
      {header && <div className="flex h-14 shrink-0 items-center border-b border-border px-3">{header}</div>}
      <div className="flex-1 overflow-y-auto px-2 py-3">{children}</div>
      {footer && <div className="shrink-0 border-t border-border px-2 py-3">{footer}</div>}
    </aside>
  );
}

export interface SidebarNavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  badge?: React.ReactNode;
}

export function SidebarNavItem({ icon, label, active = false, collapsed = false, badge, className, ...props }: SidebarNavItemProps) {
  return (
    <button
      type="button"
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        collapsed && 'justify-center px-0',
        className,
      )}
      {...props}
    >
      {icon}
      {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
      {!collapsed && badge}
    </button>
  );
}
