import { NextResponse, type NextRequest } from 'next/server';

export const DEFAULT_SESSION_COOKIE_NAME = 'easydev_session';

export interface CreateAuthMiddlewareOptions {
  /** Path prefixes reachable without a session (login, password reset, SSO callback, etc). */
  publicPaths: string[];
  /** Name of the lightweight, readable cookie IAM sets to mark an active session. */
  sessionCookieName?: string;
  /** Where to send unauthenticated visitors hitting a non-public path. */
  loginPath?: string;
  /** Path matcher passed to Next.js; defaults to everything except static assets/API routes. */
  matcher?: string[];
}

/**
 * Builds a Next.js middleware that only checks for the *presence* of the session cookie
 * and redirects when absent - it deliberately does not call IAM on every navigation.
 * Real session, permission, and tenant validation happen client-side via AuthProvider
 * (silent refresh on mount) and the API client's 401-triggered refresh/logout flow. This
 * keeps edge latency low and avoids hammering IAM for every route change. Every app should
 * call this factory rather than re-implementing its own cookie check.
 */
export function createAuthMiddleware(options: CreateAuthMiddlewareOptions) {
  const {
    publicPaths,
    sessionCookieName = DEFAULT_SESSION_COOKIE_NAME,
    loginPath = '/login',
    matcher = ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
  } = options;

  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (publicPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const hasSession = request.cookies.has(sessionCookieName);
    if (!hasSession) {
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return { middleware, config: { matcher } };
}
