import type { NextConfig } from 'next';

// Resolves to just the origin (protocol+host) of a configured API URL, so the
// CSP follows whatever NEXT_PUBLIC_API_BASE_URL is set to per deployment
// instead of hardcoding localhost.
function originOf(envValue: string | undefined, fallback: string): string {
  try {
    return new URL(envValue || fallback).origin;
  } catch {
    return fallback;
  }
}

const apiOrigin = originOf(process.env.NEXT_PUBLIC_API_BASE_URL, 'http://localhost:3333');

// No eval/inline-script usage exists anywhere in this app (confirmed via audit),
// so the production script-src stays strict. Development needs the standard
// Next.js dev-server exceptions: 'unsafe-eval' for @next/react-refresh-utils
// HMR runtime, and 'unsafe-inline' for Next's HMR-injected <script> tags. The
// production build never includes those, so we keep the strict policy there.
const isDev = process.env.NODE_ENV !== 'production';

const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval'"
  : "'self'";

const CSP = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data:",
  `connect-src 'self' ${apiOrigin}${isDev ? ' ws:' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@easydev/types',
    '@easydev/utils',
    '@easydev/design-system',
    '@easydev/api-client',
    '@easydev/auth',
    '@easydev/permissions',
    '@easydev/feature-flags',
    '@easydev/stores',
    '@easydev/analytics',
    '@easydev/ui',
    '@easydev/observability',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
