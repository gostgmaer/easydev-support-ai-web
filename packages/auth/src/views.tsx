'use client';

import * as React from 'react';
import { focusRingClassName } from '@easydev/design-system';

export interface AuthStatusViewProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

function AuthStatusView({ title, description, actionLabel, onAction }: AuthStatusViewProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 p-6 text-center dark:border-neutral-800">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
        <button
          type="button"
          onClick={onAction}
          className={`w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white ${focusRingClassName}`}
        >
          {actionLabel}
        </button>
      </div>
    </main>
  );
}

export interface SessionExpiredViewProps {
  onSignInAgain: () => void;
}

export function SessionExpiredView({ onSignInAgain }: SessionExpiredViewProps) {
  return (
    <AuthStatusView
      title="Your session has expired"
      description="For your security, you've been signed out after a period of inactivity. Sign in again to continue."
      actionLabel="Sign in again"
      onAction={onSignInAgain}
    />
  );
}

export interface UnauthorizedViewProps {
  onGoBack: () => void;
}

/** Shown when an authenticated user lacks the permission a route/action requires. */
export function UnauthorizedView({ onGoBack }: UnauthorizedViewProps) {
  return (
    <AuthStatusView
      title="You don't have access to this"
      description="Your account doesn't have the permissions required to view this page. Contact a tenant admin if you believe this is a mistake."
      actionLabel="Go back"
      onAction={onGoBack}
    />
  );
}

export interface ForbiddenViewProps {
  onSwitchTenant: () => void;
}

/** Shown when a tenant boundary is violated (suspended tenant, wrong-tenant resource). */
export function ForbiddenView({ onSwitchTenant }: ForbiddenViewProps) {
  return (
    <AuthStatusView
      title="Access denied for this organization"
      description="This resource isn't available for your current organization. Try switching to a different one."
      actionLabel="Switch organization"
      onAction={onSwitchTenant}
    />
  );
}
