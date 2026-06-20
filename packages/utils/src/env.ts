/** Reads a client-safe (NEXT_PUBLIC_-prefixed) environment variable. */
export function getEnvVar(name: string, fallback?: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

export function requireEnvVar(name: string): string {
  const value = getEnvVar(name);
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function parseBoolEnv(name: string, fallback = false): boolean {
  const value = getEnvVar(name);
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}
