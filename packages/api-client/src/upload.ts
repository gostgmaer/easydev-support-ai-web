import { mapNetworkError, ApiClientError } from './errors';

export interface UploadOptions {
  method?: 'POST' | 'PUT';
  fieldName?: string;
  fields?: Record<string, string>;
  headers?: Record<string, string>;
  onProgress?: (progress: { loaded: number; total: number; percent: number }) => void;
  signal?: AbortSignal;
}

/**
 * Uploads a file via XMLHttpRequest (chosen over fetch specifically because it
 * exposes upload progress events, which the Fetch API still does not).
 */
export function uploadFile<T = unknown>(
  url: string,
  file: File | Blob,
  options: UploadOptions = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    for (const [key, value] of Object.entries(options.fields ?? {})) {
      formData.append(key, value);
    }
    formData.append(options.fieldName ?? 'file', file);

    xhr.open(options.method ?? 'POST', url, true);
    xhr.withCredentials = true;

    for (const [key, value] of Object.entries(options.headers ?? {})) {
      xhr.setRequestHeader(key, value);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      options.onProgress?.({
        loaded: event.loaded,
        total: event.total,
        percent: Math.round((event.loaded / event.total) * 100),
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : (undefined as T));
        } catch {
          resolve(xhr.responseText as unknown as T);
        }
      } else {
        reject(
          new ApiClientError({
            code: xhr.status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR',
            message: xhr.statusText || 'Upload failed',
            status: xhr.status,
          }),
        );
      }
    };

    xhr.onerror = () => reject(mapNetworkError(new Error('Upload network error')));
    xhr.onabort = () => reject(mapNetworkError(new DOMException('Upload aborted', 'AbortError')));

    options.signal?.addEventListener('abort', () => xhr.abort(), { once: true });

    xhr.send(formData);
  });
}
