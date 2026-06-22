import * as React from 'react';

/** Returns `providedId` when set, otherwise a stable generated id (SSR-safe via React.useId). */
export function useGeneratedId(providedId?: string): string {
  const generatedId = React.useId();
  return providedId ?? generatedId;
}

export function useDescribedByIds(baseId: string, parts: Record<string, boolean | undefined>): string | undefined {
  const ids = Object.entries(parts)
    .filter(([, enabled]) => enabled)
    .map(([key]) => `${baseId}-${key}`);
  return ids.length > 0 ? ids.join(' ') : undefined;
}
