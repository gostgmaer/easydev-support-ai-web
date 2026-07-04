/** Validates that a redirect target is a same-origin relative path, not an
 * absolute or protocol-relative URL - guards against open-redirect phishing
 * via a crafted `?redirectTo=https://evil.example` query param on the login
 * page. Returns `fallback` for anything that isn't a safe relative path. */
export function getSafeRedirectPath(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  if (!value.startsWith('/')) return fallback;
  // Reject `//evil.com` (protocol-relative) and `/\evil.com` (browsers/some
  // routers normalize a leading backslash to a second slash).
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}
