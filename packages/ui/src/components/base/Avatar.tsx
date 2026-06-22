import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type { PresenceStatus } from '@easydev/types';
import { getInitials } from '../../utils';
import { cn } from '../../utils';

const SIZE_CLASS = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const;

const PRESENCE_COLOR: Record<PresenceStatus, string> = {
  ONLINE: 'bg-success',
  AWAY: 'bg-warning',
  BUSY: 'bg-danger',
  OFFLINE: 'bg-neutral-400',
};

export interface AvatarProps {
  src?: string;
  name: string;
  size?: keyof typeof SIZE_CLASS;
  presence?: PresenceStatus;
  className?: string;
}

export function Avatar({ src, name, size = 'md', presence, className }: AvatarProps) {
  return (
    <div className="relative inline-flex shrink-0">
      <AvatarPrimitive.Root className={cn('inline-flex items-center justify-center overflow-hidden rounded-full bg-muted', SIZE_CLASS[size], className)}>
        <AvatarPrimitive.Image src={src} alt={name} className="h-full w-full object-cover" />
        <AvatarPrimitive.Fallback className="font-medium text-muted-foreground" delayMs={src ? 400 : 0}>
          {getInitials(name)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {presence && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background',
            PRESENCE_COLOR[presence],
          )}
        />
      )}
    </div>
  );
}
