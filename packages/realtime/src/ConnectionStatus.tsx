import * as React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useRealtimeStore } from '../../hooks/src/useRealtimeStore';

export function ConnectionStatus() {
  const isConnected = useRealtimeStore((state) => state.isConnected);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold border ${
        isConnected
          ? 'bg-success/15 border-success/20 text-success'
          : 'bg-danger/15 border-danger/20 text-danger'
      }`}
      role="status"
      aria-live="polite"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5 animate-pulse" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}
