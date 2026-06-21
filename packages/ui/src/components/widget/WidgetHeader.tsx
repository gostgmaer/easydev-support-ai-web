import * as React from 'react';
import { Minus, X } from 'lucide-react';
import { IconButton } from '../base/IconButton';
import { PresenceIndicator } from '../inbox/PresenceIndicator';
import type { PresenceStatus } from '@easydev/types';
import { cn } from '../../utils';

export interface WidgetHeaderProps {
  title: string;
  subtitle?: string;
  logoUrl?: string;
  agentPresence?: PresenceStatus;
  onMinimize: () => void;
  onClose: () => void;
  className?: string;
}

export function WidgetHeader({ title, subtitle, logoUrl, agentPresence, onMinimize, onClose, className }: WidgetHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-2 rounded-t-lg bg-primary px-4 py-3 text-primary-foreground', className)}>
      <div className="flex items-center gap-2.5">
        {logoUrl && <img src={logoUrl} alt="" className="h-8 w-8 rounded-full bg-white object-contain" />}
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
          {agentPresence && <PresenceIndicator status={agentPresence} className="text-primary-foreground/80" />}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <IconButton icon={<Minus className="h-4 w-4" />} label="Minimize" size="sm" variant="ghost" className="text-primary-foreground hover:bg-white/10" onClick={onMinimize} />
        <IconButton icon={<X className="h-4 w-4" />} label="Close" size="sm" variant="ghost" className="text-primary-foreground hover:bg-white/10" onClick={onClose} />
      </div>
    </div>
  );
}
