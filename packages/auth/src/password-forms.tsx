'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { focusRingClassName } from '@easydev/design-system';
import { useAuth } from './auth-provider';

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  tenantSlug: z.string().optional(),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  title?: string;
  loginHref?: string;
}

/** Guest-only form: requests a password reset email via IAM. */
export function ForgotPasswordForm({ title = 'Reset your password' }: ForgotPasswordFormProps) {
  const { iamClient } = useAuth();
  const [submitted, setSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await iamClient.forgotPassword(values);
      setSubmitted(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not send the reset email');
    }
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-2 rounded-lg border border-neutral-200 p-6 text-center dark:border-neutral-800">
          <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-neutral-500">
            If an account matches that address, we&apos;ve sent a link to reset your password.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800"
        noValidate
      >
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

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
            {...register('email')}
          />
          {errors.email && (
            <p role="alert" className="text-xs text-danger">
              {errors.email.message}
            </p>
          )}
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
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </main>
  );
}

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  /** The reset token from the emailed link's query string. */
  token: string;
  onSuccess: () => void;
}

/** Guest-only form: completes a password reset using the emailed token. */
export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const { iamClient } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await iamClient.resetPassword({ token, newPassword: values.newPassword });
      onSuccess();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not reset your password');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800"
        noValidate
      >
        <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>

        <div className="space-y-1">
          <label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className={`w-full rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 ${focusRingClassName}`}
            aria-invalid={errors.newPassword ? 'true' : undefined}
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p role="alert" className="text-xs text-danger">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`w-full rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 ${focusRingClassName}`}
            aria-invalid={errors.confirmPassword ? 'true' : undefined}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p role="alert" className="text-xs text-danger">
              {errors.confirmPassword.message}
            </p>
          )}
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
          {isSubmitting ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </main>
  );
}
