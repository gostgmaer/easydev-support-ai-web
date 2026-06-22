import * as React from 'react';
import { AlertTriangle, ShieldOff, WifiOff, PlugZap, ServerCrash, RotateCw } from 'lucide-react';
import { Button } from '../base/Button';
import { cn } from '../../utils';

export interface ErrorStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({ icon, title, description, onRetry, retryLabel = 'Try again', className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 px-6 py-12 text-center', className)}>
      <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        {icon ?? <AlertTriangle className="h-6 w-6" />}
      </span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {onRetry && (
        <Button type="button" size="sm" variant="outline" className="mt-2" leadingIcon={<RotateCw className="h-3.5 w-3.5" />} onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

type PresetProps = Omit<ErrorStateProps, 'icon' | 'title'> & { title?: string };

export function ApiErrorState(props: PresetProps) {
  return <ErrorState icon={<AlertTriangle className="h-6 w-6" />} title="Something went wrong" description="The request failed. Please try again." {...props} />;
}

export function PermissionDeniedState(props: PresetProps) {
  return <ErrorState icon={<ShieldOff className="h-6 w-6" />} title="Permission denied" description="You don't have access to view this content." {...props} />;
}

export function NetworkErrorState(props: PresetProps) {
  return <ErrorState icon={<WifiOff className="h-6 w-6" />} title="Network error" description="Check your internet connection and try again." {...props} />;
}

export function RealtimeDisconnectedState(props: PresetProps) {
  return <ErrorState icon={<PlugZap className="h-6 w-6" />} title="Realtime connection lost" description="We're trying to reconnect you automatically." {...props} />;
}

export function ServerErrorState(props: PresetProps) {
  return <ErrorState icon={<ServerCrash className="h-6 w-6" />} title="Server error" description="Our servers ran into a problem. Please try again shortly." {...props} />;
}
