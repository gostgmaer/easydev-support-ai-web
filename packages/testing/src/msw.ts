import { setupServer } from 'msw/node';
import type { RequestHandler } from 'msw';

export const baseHandlers: RequestHandler[] = [];

/** Apps/packages call this with their own handlers appended to baseHandlers. */
export function createMockServer(handlers: RequestHandler[] = []) {
  return setupServer(...baseHandlers, ...handlers);
}
