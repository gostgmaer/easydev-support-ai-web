'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { focusRingClassName } from '@easydev/design-system';
import { safeLocalStorage } from '@easydev/utils';
import { useAuth } from './auth-provider';

const LAST_TENANT_SLUG_KEY = 'easydev.auth.lastTenantSlug';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantSlug: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  title: string;
  subtitle?: string;
  forgotPasswordHref?: string;
  onSuccess: () => void;
}

/**
 * Shared login form used by every app shell - no app implements its own login logic.
 * The tenant slug is non-sensitive convenience state only (pre-fill on return visits);
 * it is never treated as a security boundary, the IAM session response is.
 */
export function LoginForm({ title, subtitle, forgotPasswordHref = '/forgot-password', onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenantSlug: safeLocalStorage.get(LAST_TENANT_SLUG_KEY) ?? '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      if (values.tenantSlug) safeLocalStorage.set(LAST_TENANT_SLUG_KEY, values.tenantSlug);
      onSuccess();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800"
        noValidate
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`w-full rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 ${focusRingClassName}`}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-danger">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={`w-full rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 ${focusRingClassName}`}
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="text-xs text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="tenantSlug" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Organization (optional)
          </label>
          <input
            id="tenantSlug"
            type="text"
            autoComplete="organization"
            placeholder="acme"
            className={`w-full rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 ${focusRingClassName}`}
            {...register('tenantSlug')}
          />
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-danger">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${focusRingClassName}`}
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="text-center">
          <Link href={forgotPasswordHref} className={`text-xs font-medium text-primary-600 hover:underline ${focusRingClassName}`}>
            Forgot your password?
          </Link>
        </div>
      </form>
    </main>
  );
}
