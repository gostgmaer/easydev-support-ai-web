import type { FeatureFlagMap, FeatureFlagValue } from '@easydev/types';

/** Flags returned when the backend is unreachable; fail closed for safety. */
export const DEFAULT_FLAGS: FeatureFlagMap = {};

export function resolveFlag(
  flags: FeatureFlagMap,
  key: string,
  fallback: FeatureFlagValue = false,
): FeatureFlagValue {
  return key in flags ? flags[key]! : fallback;
}
