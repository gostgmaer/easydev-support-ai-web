import type { NextConfig } from "next";

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

const apiOrigin = originOf(process.env.NEXT_PUBLIC_API_BASE_URL, "http://localhost:3333");
const socketOrigin = originOf(process.env.NEXT_PUBLIC_SOCKET_URL, "http://localhost:3000");
// socket.io upgrades http(s) to ws(s) for the actual websocket connection.
const socketWsOrigin = socketOrigin.replace(/^http/, "ws");

// No eval/inline-script usage exists anywhere in this app (confirmed via audit),
// so script-src can stay strict. style-src needs 'unsafe-inline' for Next.js/
// Tailwind's runtime style injection - the one pragmatic exception.
// const CSP = [
//   "default-src 'self'",
//   "script-src 'self'",
//   "style-src 'self' 'unsafe-inline'",
//   "font-src 'self'",
//   `img-src 'self' data: ${apiOrigin}`,
//   `connect-src 'self' ${apiOrigin} ${socketOrigin} ${socketWsOrigin}`,
//   "frame-ancestors 'none'",
//   "base-uri 'self'",
//   "form-action 'self'",
// ].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@easydev/ui",
    "@easydev/icons",
    "@easydev/forms",
    "@easydev/layouts",
    "@easydev/charts",
    "@easydev/realtime",
    "@easydev/observability"
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
