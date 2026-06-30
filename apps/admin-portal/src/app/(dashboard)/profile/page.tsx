'use client';

import * as React from 'react';
import { User, Key, Monitor, Trash2, Eye, EyeOff, Shield } from 'lucide-react';
import {
  useIamProfile,
  useUpdateIamProfile,
  useChangePassword,
  useIamSessions,
  useRevokeIamSession,
} from '../../../hooks/useAdminQueries';

export default function ProfilePage() {
  const { data: profile, isLoading: loadingProfile } = useIamProfile();
  const { data: sessions = [], isLoading: loadingSessions } = useIamSessions();
  const updateProfile = useUpdateIamProfile();
  const changePassword = useChangePassword();
  const revokeSession = useRevokeIamSession();

  const [form, setForm] = React.useState({ displayName: '', firstName: '', lastName: '', timezone: '', locale: '' });
  const [passwordForm, setPasswordForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = React.useState(false);
  const [showNewPw, setShowNewPw] = React.useState(false);
  const [passwordMsg, setPasswordMsg] = React.useState<{ ok: boolean; text: string } | null>(null);

  React.useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        timezone: profile.timezone ?? '',
        locale: profile.locale ?? '',
      });
    }
  }, [profile]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      displayName: form.displayName || undefined,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      timezone: form.timezone || undefined,
      locale: form.locale || undefined,
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ ok: false, text: 'Passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ ok: false, text: 'New password must be at least 8 characters.' });
      return;
    }
    changePassword.mutate(
      { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
      {
        onSuccess: () => {
          setPasswordMsg({ ok: true, text: 'Password changed successfully.' });
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: () => setPasswordMsg({ ok: false, text: 'Incorrect current password or server error.' }),
      },
    );
  };

  if (loadingProfile) {
    return <p className="text-xs text-neutral-400 animate-pulse p-8">Loading profile…</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl" role="region" aria-label="My Profile">
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
        <h1 className="text-base font-bold text-neutral-900">My Profile</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Manage your account identity and preferences.</p>
      </div>

      {/* Profile Info */}
      <section className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <User className="h-4 w-4 text-neutral-400" /> Profile Information
        </h2>
        {profile && (
          <p className="text-xs text-neutral-500">
            <span className="font-semibold">Email: </span>{profile.email}
            <span className="ml-3 text-[10px] text-neutral-400">ID: {profile.id}</span>
          </p>
        )}
        <form onSubmit={handleProfileSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {(
            [
              { key: 'displayName', label: 'Display Name' },
              { key: 'firstName', label: 'First Name' },
              { key: 'lastName', label: 'Last Name' },
              { key: 'timezone', label: 'Timezone', placeholder: 'e.g. America/New_York' },
              { key: 'locale', label: 'Locale', placeholder: 'e.g. en-US' },
            ] as { key: keyof typeof form; label: string; placeholder?: string }[]
          ).map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="font-semibold text-neutral-600">{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="text-xs font-bold bg-primary-600 text-white rounded px-4 py-2 hover:bg-primary-700 disabled:opacity-60"
            >
              {updateProfile.isPending ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Key className="h-4 w-4 text-neutral-400" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-neutral-600">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full border border-neutral-200 rounded p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="button" onClick={() => setShowCurrentPw((v) => !v)} className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600">
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-neutral-600">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                required
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full border border-neutral-200 rounded p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600">
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-neutral-600">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="border border-neutral-200 rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {passwordMsg && (
            <p className={`text-[11px] font-semibold ${passwordMsg.ok ? 'text-success' : 'text-danger'}`}>
              {passwordMsg.text}
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="text-xs font-bold bg-neutral-800 text-white rounded px-4 py-2 hover:bg-neutral-900 disabled:opacity-60"
            >
              {changePassword.isPending ? 'Updating…' : 'Change Password'}
            </button>
          </div>
        </form>
      </section>

      {/* Active Sessions */}
      <section className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Monitor className="h-4 w-4 text-neutral-400" /> Active Sessions
        </h2>
        {loadingSessions ? (
          <p className="text-xs text-neutral-400 animate-pulse">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">No active sessions.</p>
        ) : (
          <div className="space-y-2 text-xs">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded border border-neutral-100 bg-neutral-50 px-3 py-2.5">
                <div className="space-y-0.5 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    {s.isCurrent && (
                      <span className="text-[9px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                        <Shield className="h-2.5 w-2.5" /> Current
                      </span>
                    )}
                    <span className="font-semibold text-neutral-700 truncate">{s.userAgent}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    {s.ipAddress} · Last active {new Date(s.lastActiveAt).toLocaleString()}
                  </p>
                </div>
                {!s.isCurrent && (
                  <button
                    onClick={() => { if (confirm('Revoke this session?')) revokeSession.mutate(s.id); }}
                    disabled={revokeSession.isPending}
                    className="flex items-center gap-1 text-[10px] font-bold text-danger hover:underline disabled:opacity-50 shrink-0"
                    aria-label="Revoke session"
                  >
                    <Trash2 className="h-3 w-3" /> Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
