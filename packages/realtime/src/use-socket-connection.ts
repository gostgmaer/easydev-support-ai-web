import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRealtimeStore } from "./realtime-store";

export interface UseSocketConnectionOptions {
  /** Full namespace URL to connect to, or null if not ready yet (e.g. waiting
   * on an auth token) - the socket isn't created until this becomes non-null,
   * and is torn down if it goes back to null. */
  url: string | null;
  getAuth: () => Record<string, unknown>;
  query?: Record<string, string>;
  /** Called after a successful reconnect - the hook for replaying/refetching
   * whatever may have been missed while disconnected (each app picks its own
   * strategy, e.g. invalidating React Query caches). */
  onReconnect?: () => void;
}

export interface UseSocketConnectionResult {
  socket: Socket | null;
}

/** Shared connection lifecycle for both apps' realtime hooks: lazy connect,
 * uncapped reconnection attempts with socket.io's own exponential backoff
 * capped at a sane max delay (previously both apps gave up permanently after
 * ~10 tries, roughly 30-50s into an outage), and OS-level offline detection so
 * a dead network shows "Offline" instead of an endlessly spinning
 * "Reconnecting…". Event routing stays app-specific - callers register their
 * own socket.on(...) handlers on the returned socket once it's non-null. */
export function useSocketConnection(options: UseSocketConnectionOptions): UseSocketConnectionResult {
  const { url } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const setConnected = useRealtimeStore((state) => state.setConnected);
  const setConnectionStatus = useRealtimeStore((state) => state.setConnectionStatus);

  useEffect(() => {
    if (!url) {
      setSocket(null);
      return;
    }

    const instance = io(url, {
      autoConnect: false,
      auth: optionsRef.current.getAuth(),
      query: optionsRef.current.query,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.5,
      transports: ["websocket"],
    });

    const handleConnect = () => {
      setConnected(true);
      setConnectionStatus("CONNECTED");
    };
    const handleDisconnect = () => {
      setConnected(false);
      setConnectionStatus(navigator.onLine ? "DISCONNECTED" : "OFFLINE");
    };
    const handleReconnectAttempt = () => {
      if (navigator.onLine) setConnectionStatus("RECONNECTING");
    };
    const handleReconnect = () => {
      setConnected(true);
      setConnectionStatus("CONNECTED");
      optionsRef.current.onReconnect?.();
    };
    const handleOffline = () => {
      setConnectionStatus("OFFLINE");
      instance.disconnect();
    };
    const handleOnline = () => {
      setConnectionStatus("CONNECTING");
      instance.connect();
    };

    instance.on("connect", handleConnect);
    instance.on("disconnect", handleDisconnect);
    instance.io.on("reconnect_attempt", handleReconnectAttempt);
    instance.io.on("reconnect", handleReconnect);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setConnectionStatus("OFFLINE");
    }

    instance.connect();
    setSocket(instance);

    return () => {
      instance.off("connect", handleConnect);
      instance.off("disconnect", handleDisconnect);
      instance.io.off("reconnect_attempt", handleReconnectAttempt);
      instance.io.off("reconnect", handleReconnect);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      instance.disconnect();
      setSocket(null);
    };
    // Only `url` re-triggers connect/teardown - getAuth/query/onReconnect are
    // read fresh via optionsRef each time, so passing new inline closures on
    // every render doesn't tear down and recreate the socket.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, setConnected, setConnectionStatus]);

  return { socket };
}
