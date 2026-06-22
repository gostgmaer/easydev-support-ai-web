'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSessionStore } from '@easydev/stores';
import { focusRingClassName } from '@easydev/design-system';
import { useAuth } from './auth-provider';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  avatarUrl: z.union([z.string().url('Enter a valid URL'), z.literal('')]).optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

/** Edits the signed-in user's displayName/avatar/locale/timezone via the shared updateProfile action. */
export function ProfileView() {
  const { user, updateProfile } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName ?? '', avatarUrl: user?.avatarUrl ?? '' },
  });

  if (!user) return null;

  const onSubmit = async (values: ProfileFormValues) => {
    setServerError(null);
    setSuccess(false);
    try {
      await updateProfile({ ...values, avatarUrl: values.avatarUrl || undefined });
      setSuccess(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not update your profile');
    }
  };

  return (
    <section className="space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
      <h2 className="text-lg font-medium">Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label htmlFor="displayName" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Display name
          </label>
          <input
            id="displayName"
            className={`w-full rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 ${focusRingClassName}`}
            aria-invalid={errors.displayName ? 'true' : undefined}
            {...register('displayName')}
          />
          {errors.displayName && (
            <p role="alert" className="text-xs text-danger">
              {errors.displayName.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="avatarUrl" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            className={`w-full rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 ${focusRingClassName}`}
            aria-invalid={errors.avatarUrl ? 'true' : undefined}
            {...register('avatarUrl')}
          />
          {errors.avatarUrl && (
            <p role="alert" className="text-xs text-danger">
              {errors.avatarUrl.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="locale" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Locale
            </label>
            <input
              id="locale"
              placeholder="en-US"
              className={`w-full rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 ${focusRingClassName}`}
              {...register('locale')}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="timezone" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Timezone
            </label>
            <input
              id="timezone"
              placeholder="America/New_York"
              className={`w-full rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 ${focusRingClassName}`}
              {...register('timezone')}
            />
          </div>
        </div>

        {success && <p className="text-sm text-success">Profile updated.</p>}
        {serverError && (
          <p role="alert" className="text-sm text-danger">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${focusRingClassName}`}
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </section>
  );
}

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

/** Lets the signed-in user change their own password (requires the current one). */
export function PasswordChangeForm() {
  const { iamClient } = useAuth();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeFormValues>({ resolver: zodResolver(passwordChangeSchema) });

  const onSubmit = async (values: PasswordChangeFormValues) => {
    setServerError(null);
    setSuccess(false);
    try {
      await iamClient.changePassword(values);
      reset();
      setSuccess(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not change your password');
    }
  };

  return (
    <section className="space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
      <h2 className="text-lg font-medium">Change password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            className={`w-full rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900 ${focusRingClassName}`}
            aria-invalid={errors.currentPassword ? 'true' : undefined}
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <p role="alert" className="text-xs text-danger">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

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
            Confirm new password
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

        {success && <p className="text-sm text-success">Password changed.</p>}
        {serverError && (
          <p role="alert" className="text-sm text-danger">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${focusRingClassName}`}
        >
          {isSubmitting ? 'Changing…' : 'Change password'}
        </button>
      </form>
    </section>
  );
}

/** Lists the user's active IAM sessions/devices and lets them revoke any but the current one. */
export function ActiveSessionsPanel() {
  const { iamClient } = useAuth();
  const sessions = useSessionStore((state) => state.activeSessions);
  const setActiveSessions = useSessionStore((state) => state.setActiveSessions);
  const removeSession = useSessionStore((state) => state.removeSession);
  const [loading, setLoading] = React.useState(true);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    iamClient
      .listSessions()
      .then((list) => {
        if (!cancelled) setActiveSessions(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load active sessions');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [iamClient, setActiveSessions]);

  const handleRevoke = async (sessionId: string) => {
    setRevokingId(sessionId);
    setError(null);
    try {
      await iamClient.revokeSession(sessionId);
      removeSession(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not revoke that session');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <section className="space-y-4 rounded-lg border border-neutral-200 p-6 dark:border-neutral-800">
      <h2 className="text-lg font-medium">Active sessions</h2>

      {loading && <p className="text-sm text-neutral-500">Loading…</p>}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {!loading && sessions.length === 0 && <p className="text-sm text-neutral-500">No active sessions found.</p>}

      <ul className="space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 px-3 py-2.5 text-sm dark:border-neutral-800"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">
                {session.device}
                {session.current && (
                  <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-primary-600">
                    This device
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-neutral-500">
                {session.location ?? session.ip} · last active {new Date(session.lastActiveAt).toLocaleString()}
              </p>
            </div>
            {!session.current && (
              <button
                type="button"
                onClick={() => handleRevoke(session.id)}
                disabled={revokingId === session.id}
                className={`shrink-0 rounded-md border border-danger px-3 py-1.5 text-xs font-medium text-danger disabled:opacity-50 ${focusRingClassName}`}
              >
                {revokingId === session.id ? 'Revoking…' : 'Revoke'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
