export type FeatureFlagValue = boolean | string | number;

export interface FeatureFlag {
  key: string;
  value: FeatureFlagValue;
  /** When set, the flag is only enabled for callers holding this permission key. */
  requiredPermission?: string;
  updatedAt: string;
}

export interface FeatureFlagMap {
  [key: string]: FeatureFlagValue;
}
