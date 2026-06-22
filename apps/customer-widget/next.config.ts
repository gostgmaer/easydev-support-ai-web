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

// Next.js dev mode's webpack runtime and React Refresh rely on eval() and
// inline <script> tags (HMR, hydration data) - a strict script-src breaks the
// app outright in dev. Production builds need neither, so only dev gets the
// relaxed policy.
const isDev = process.env.NODE_ENV !== 'production';
const SCRIPT_SRC = isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self'";

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
//
// X-Frame-Options has no token that means "allow framing from anywhere" -
// only DENY, SAMEORIGIN, and the long-removed ALLOW-FROM exist, so it's
// omitted here entirely and CSP's frame-ancestors (which every current
// browser prioritizes over X-Frame-Options when both are present) is the
// actual enforcement mechanism.
const EMBED_CSP = [
  "default-src 'self'",
  SCRIPT_SRC,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `img-src 'self' data: ${apiOrigin}`,
  CONNECT_SRC,
  "frame-ancestors *",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

// The bare root is only ever loaded as a direct top-level visit - never framed
// by anything, this app's own /embed route included.
const APP_CSP = [
  "default-src 'self'",
  SCRIPT_SRC,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `img-src 'self' data: ${apiOrigin}`,
  CONNECT_SRC,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const ROOT_ROUTES = ['/'];

// /widget and its sibling views (all under the (widget) route group, reached
// from one another via client-side navigation with no fresh frame load) are
// always loaded nested inside /embed, which is itself meant to sit on an
// arbitrary external origin. frame-ancestors checks the WHOLE ancestor chain,
// not just the immediate parent - so even though /embed embeds /widget
// same-origin, the chain still includes whatever third-party page embedded
// /embed in the first place, and 'self' would reject that. These routes need
// the same open policy as /embed itself, not the restrictive one.
const WIDGET_ROUTES = ['/widget', '/chat', '/help', '/tickets', '/history', '/feedback'];

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
          { key: 'Content-Security-Policy', value: EMBED_CSP },
          ...COMMON_SECURITY_HEADERS,
        ],
      },
      ...WIDGET_ROUTES.map((source) => ({
        source,
        headers: [
          { key: 'Content-Security-Policy', value: EMBED_CSP },
          ...COMMON_SECURITY_HEADERS,
        ],
      })),
      ...ROOT_ROUTES.map((source) => ({
        source,
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: APP_CSP },
          ...COMMON_SECURITY_HEADERS,
        ],
      })),
    ];
  },
};

export default nextConfig;
