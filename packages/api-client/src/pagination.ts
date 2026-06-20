import type { CursorPaginatedResult } from '@easydev/types';
import type { ApiClient } from './http-client';

/**
 * Lazily walks every page of a cursor-paginated endpoint, yielding each page's
 * items. Stops once the server reports hasMore: false or nextCursor is absent.
 */
export async function* iterateCursorPages<T>(
  client: ApiClient,
  path: string,
  options: { query?: Record<string, string | number | boolean | undefined>; limit?: number } = {},
): AsyncGenerator<T[], void, unknown> {
  let cursor: string | undefined;
  do {
    const page = await client.get<CursorPaginatedResult<T>>(path, {
      query: { ...options.query, cursor, limit: options.limit },
    });
    yield page.data;
    cursor = page.hasMore ? page.nextCursor : undefined;
  } while (cursor);
}

/** Eagerly collects every page into a single array. Use only for bounded result sets. */
export async function collectAllPages<T>(
  client: ApiClient,
  path: string,
  options: { query?: Record<string, string | number | boolean | undefined>; limit?: number } = {},
): Promise<T[]> {
  const all: T[] = [];
  for await (const page of iterateCursorPages<T>(client, path, options)) {
    all.push(...page);
  }
  return all;
}
