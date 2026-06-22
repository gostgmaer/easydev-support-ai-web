const CHANNEL_NAME = 'easydev-auth';

export type AuthBroadcastMessage = { type: 'logout' } | { type: 'session-changed' };

export interface AuthBroadcastChannel {
  /** Sends a message to every other tab listening on this channel. */
  post: (message: AuthBroadcastMessage) => void;
  /** Subscribes to messages from other tabs. Returns an unsubscribe function. */
  subscribe: (listener: (message: AuthBroadcastMessage) => void) => () => void;
  close: () => void;
}

/**
 * Wraps BroadcastChannel for cross-tab auth coordination (logout propagation,
 * session resync after login/tenant-switch/profile-update in another tab).
 * Feature-detected: degrades to a no-op when unavailable (older browsers, SSR).
 */
export function createAuthBroadcastChannel(): AuthBroadcastChannel {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return { post: () => {}, subscribe: () => () => {}, close: () => {} };
  }

  const channel = new BroadcastChannel(CHANNEL_NAME);

  return {
    post: (message) => channel.postMessage(message),
    subscribe: (listener) => {
      const handler = (event: MessageEvent<AuthBroadcastMessage>) => listener(event.data);
      channel.addEventListener('message', handler);
      return () => channel.removeEventListener('message', handler);
    },
    close: () => channel.close(),
  };
}
