interface CacheEntry {
  value: boolean;
  expiresAt: number;
}

/** Small TTL memoization cache for repeated permission lookups within a render pass. */
export class PermissionCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(private readonly ttlMs = 5000) {}

  getOrCompute(key: string, compute: () => boolean): boolean {
    const now = Date.now();
    const cached = this.entries.get(key);
    if (cached && cached.expiresAt > now) return cached.value;

    const value = compute();
    this.entries.set(key, { value, expiresAt: now + this.ttlMs });
    return value;
  }

  invalidate(): void {
    this.entries.clear();
  }
}
