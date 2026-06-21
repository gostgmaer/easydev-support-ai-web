import type { NextConfig } from 'next';

// Resolves to just the origin (protocol+host) of a configured URL, so the CSP
// follows whatever the env vars are set to per deployment instead of
// hardcoding localhost. Returns null when the env var isn't set at all (the
// widget embed is optional - see (public)/layout.tsx).
function originOf(envValue: string | undefined, fallback: string | null): string | null {
  if (!envValue && !fallback) return null;
  try {
    return new URL(envValue || fallback || '').origin;
  } catch {
    return fallback;
  }
}

const apiOrigin = originOf(process.env.NEXT_PUBLIC_API_BASE_URL, 'http://localhost:3333');
// The customer-widget deployment whose embed.js this app optionally loads
// (apps/help-center/src/app/(public)/layout.tsx) and whose iframe that
// script injects - both same origin.
const widgetOrigin = originOf(process.env.NEXT_PUBLIC_WIDGET_EMBED_URL, null);

// No eval/inline-script usage exists anywhere in this app (confirmed via audit),
// so script-src can stay strict aside from the optional widget embed origin.
// style-src needs 'unsafe-inline' for Next.js/Tailwind's runtime style
// injection - the one pragmatic exception.
const CSP = [
  "default-src 'self'",
  `script-src 'self'${widgetOrigin ? ` ${widgetOrigin}` : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data:",
  `connect-src 'self' ${apiOrigin}`,
  `frame-src 'self'${widgetOrigin ? ` ${widgetOrigin}` : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  transpilePackages: [
    '@easydev/types',
    '@easydev/utils',
    '@easydev/design-system',
    '@easydev/api-client',
    '@easydev/feature-flags',
    '@easydev/stores',
    '@easydev/analytics',
    '@easydev/ui',
    '@easydev/auth',
    '@easydev/permissions',
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
