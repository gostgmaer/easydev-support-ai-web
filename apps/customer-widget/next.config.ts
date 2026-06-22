import type { NextConfig } from 'next';

// Resolves to just the origin (protocol+host) of a configured URL, so the CSP
// follows whatever NEXT_PUBLIC_API_BASE_URL/NEXT_PUBLIC_SOCKET_URL are set to
// per deployment instead of hardcoding localhost.
function originOf(envValue: string | undefined, fallback: string): string {
  try {
    return new URL(envValue || fallback).origin;
  } catch {
    return fallback;
  }
}

const apiOrigin = originOf(process.env.NEXT_PUBLIC_API_BASE_URL, 'http://localhost:3333');
const socketOrigin = originOf(process.env.NEXT_PUBLIC_SOCKET_URL, 'http://localhost:3333');
const socketWsOrigin = socketOrigin.replace(/^http/, 'ws');

const CONNECT_SRC = `connect-src 'self' ${apiOrigin} ${socketOrigin} ${socketWsOrigin}`;

const COMMON_SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

// /embed is designed to be embedded on arbitrary tenant domains - the real
// per-tenant-domain enforcement happens server-side at widget session start
// (WidgetSessionService.assertOriginAllowed), so this header is the coarse,
// static half of that defense-in-depth pair, not the actual gate.
// const EMBED_CSP = [
//   "default-src 'self'",
//   "script-src 'self'",
//   "style-src 'self' 'unsafe-inline'",
//   "font-src 'self'",
//   `img-src 'self' data: ${apiOrigin}`,
//   CONNECT_SRC,
//   "frame-ancestors *",
//   "base-uri 'self'",
//   "form-action 'self'",
// ].join('; ');

// Everything else is only ever framed by this app's own /embed route (same
// origin) - never by an arbitrary external site.
// const APP_CSP = [
//   "default-src 'self'",
//   "script-src 'self'",
//   "style-src 'self' 'unsafe-inline'",
//   "font-src 'self'",
//   `img-src 'self' data: ${apiOrigin}`,
//   CONNECT_SRC,
//   "frame-ancestors 'self'",
//   "base-uri 'self'",
//   "form-action 'self'",
// ].join('; ');

const APP_ROUTES = ['/', '/widget', '/chat', '/help', '/tickets', '/history', '/feedback'];

const nextConfig: NextConfig = {
  transpilePackages: [
    '@easydev/types',
    '@easydev/utils',
    '@easydev/design-system',
    '@easydev/api-client',
    '@easydev/stores',
    '@easydev/analytics',
    '@easydev/ui',
    '@easydev/observability',
    '@easydev/realtime',
  ],
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          // { key: 'Content-Security-Policy', value: EMBED_CSP },
          ...COMMON_SECURITY_HEADERS,
        ],
      },
      ...APP_ROUTES.map((source) => ({
        source,
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // { key: 'Content-Security-Policy', value: APP_CSP },
          ...COMMON_SECURITY_HEADERS,
        ],
      })),
    ];
  },
};

export default nextConfig;
