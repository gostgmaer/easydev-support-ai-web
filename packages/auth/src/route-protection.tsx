'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
}

/** Route-level guard: redirects unauthenticated visitors, renders a fallback while resolving. */
export function RequireAuth({ children, redirectTo = '/login', loadingFallback = null }: RequireAuthProps) {
  const { status } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') router.replace(redirectTo);
  }, [status, router, redirectTo]);

  if (status === 'authenticated') return <>{children}</>;
  return <>{loadingFallback}</>;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<RequireAuthProps, 'children'>,
): React.ComponentType<P> {
  function Guarded(props: P) {
    return (
      <RequireAuth {...options}>
        <Component {...props} />
      </RequireAuth>
    );
  }
  Guarded.displayName = `withAuth(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Guarded;
}

export interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
}

/** Inverse of RequireAuth: redirects already-authenticated visitors away from guest-only pages
 * (login, forgot/reset password) so a signed-in user can't land back on them. */
export function GuestRoute({ children, redirectTo = '/', loadingFallback = null }: GuestRouteProps) {
  const { status } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'authenticated') router.replace(redirectTo);
  }, [status, router, redirectTo]);

  if (status === 'authenticated') return <>{loadingFallback}</>;
  return <>{children}</>;
}

export function withGuest<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<GuestRouteProps, 'children'>,
): React.ComponentType<P> {
  function Guarded(props: P) {
    return (
      <GuestRoute {...options}>
        <Component {...props} />
      </GuestRoute>
    );
  }
  Guarded.displayName = `withGuest(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Guarded;
}
