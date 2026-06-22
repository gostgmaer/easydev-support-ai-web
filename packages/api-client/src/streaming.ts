export interface SseOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onOpen?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Consumes a Server-Sent-Events stream via fetch + ReadableStream (rather than
 * EventSource) so that Authorization/Tenant headers can be attached - native
 * EventSource cannot set custom request headers.
 */
export async function streamSse(
  url: string,
  onMessage: (data: string, event?: string) => void,
  options: SseOptions = {},
): Promise<void> {
  const response = await fetch(url, {
    headers: { Accept: 'text/event-stream', ...options.headers },
    signal: options.signal,
    credentials: 'include',
  });

  if (!response.ok || !response.body) {
    const error = new Error(`SSE connection failed with status ${response.status}`);
    options.onError?.(error);
    throw error;
  }
  options.onOpen?.();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';

      for (const rawEvent of events) {
        let eventName: string | undefined;
        const dataLines: string[] = [];
        for (const line of rawEvent.split('\n')) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim();
          else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
        }
        if (dataLines.length > 0) onMessage(dataLines.join('\n'), eventName);
      }
    }
  } catch (error) {
    options.onError?.(error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}

/** Consumes a newline-delimited JSON stream (one JSON object per line). */
export async function streamNdjson<T = unknown>(
  url: string,
  onMessage: (data: T) => void,
  options: SseOptions = {},
): Promise<void> {
  const response = await fetch(url, {
    headers: options.headers,
    signal: options.signal,
    credentials: 'include',
  });

  if (!response.ok || !response.body) {
    const error = new Error(`Stream connection failed with status ${response.status}`);
    options.onError?.(error);
    throw error;
  }
  options.onOpen?.();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          onMessage(JSON.parse(line) as T);
        } catch (error) {
          options.onError?.(error);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
