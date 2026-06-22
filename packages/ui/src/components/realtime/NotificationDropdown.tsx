import * as React from 'react';
import { Bell } from 'lucide-react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { IconButton } from '../base/IconButton';
import { NotificationCenter, type NotificationCenterProps } from './NotificationCenter';

export type NotificationDropdownProps = NotificationCenterProps;

export function NotificationDropdown({ notifications, ...rest }: NotificationDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <span className="relative inline-flex">
          <IconButton icon={<Bell className="h-4 w-4" />} label="Notifications" variant="ghost" size="sm" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={6}
          className="z-dropdown w-80 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-dropdown"
        >
          <NotificationCenter notifications={notifications} {...rest} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
