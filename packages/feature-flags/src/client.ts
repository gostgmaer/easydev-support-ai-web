import type { ApiClient } from '@easydev/api-client';
import type { FeatureFlagMap } from '@easydev/types';

export class FeatureFlagClient {
  constructor(private readonly api: ApiClient) {}

  fetchFlags(): Promise<FeatureFlagMap> {
    return this.api.get<FeatureFlagMap>('/v1/settings/feature-flags');
  }
}
