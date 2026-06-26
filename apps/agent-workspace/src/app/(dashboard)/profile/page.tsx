'use client';

import React from 'react';
import { User, Shield, Key, Laptop, Loader2, Check, AlertCircle } from 'lucide-react';
import {
  useIamProfile,
  useUpdateIamProfile,
  useChangePassword,
  useIamSessions,
  useRevokeIamSession,
} from '../../../hooks/useQueries';

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useIamProfile();
  const { data: sessions = [], isLoading: sessionsLoading } = useIamSessions();
  const updateProfile = useUpdateIamProfile();
  const changePassword = useChangePassword();
  const revokeSession = useRevokeIamSession();

  const [activeTab, setActiveTab] = React.useState<'profile' | 'security' | 'sessions'>('profile');

  // Profile form
  const [displayName, setDisplayName] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [timezone, setTimezone] = React.useState('');
  const [profileSaved, setProfileSaved] = React.useState(false);

  React.useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName ?? '');
    setFirstName(profile.firstName ?? '');
    setLastName(profile.lastName ?? '');
    setTimezone(profile.timezone ?? '');
  }, [profile]);

  // Password form
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSaved, setPasswordSaved] = React.useState(false);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate(
      { displayName, firstName, lastName, timezone },
      { onSuccess: () => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000); } },
    );
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordSaved(true);
          setTimeout(() => setPasswordSaved(false), 3000);
        },
        onError: () => setPasswordError('Failed to change password. Check your current password.'),
      },
    );
  }

  const initials = profile
    ? (profile.firstName?.[0] ?? profile.displayName?.[0] ?? '?').toUpperCase() +
      (profile.lastName?.[0] ?? '').toUpperCase()
    : '??';

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50 p-6 space-y-6 overflow-y-auto" role="region" aria-label="Profile settings">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-primary-100 border-2 border-primary-200 flex items-center justify-center font-bold text-xl text-primary-700 shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-base font-bold text-neutral-900">{profile?.displayName ?? 'Your Profile'}</h1>
          <p className="text-xs text-neutral-500">{profile?.email}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">{profile?.timezone ?? 'No timezone set'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200">
        {(['profile', 'security', 'sessions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold capitalize border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs max-w-lg space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <User className="h-4 w-4" /> Personal Information
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="p-first" className="block text-[10px] font-semibold text-neutral-600 mb-1">First Name</label>
                <input
                  id="p-first"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="p-last" className="block text-[10px] font-semibold text-neutral-600 mb-1">Last Name</label>
                <input
                  id="p-last"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="p-display" className="block text-[10px] font-semibold text-neutral-600 mb-1">Display Name</label>
              <input
                id="p-display"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="p-timezone" className="block text-[10px] font-semibold text-neutral-600 mb-1">Timezone</label>
              <input
                id="p-timezone"
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. America/New_York"
                className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="text-xs px-4 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {updateProfile.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Save Changes
              </button>
              {profileSaved && (
                <span className="text-xs text-success flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Saved
                </span>
              )}
            </div>
            {updateProfile.isError && (
              <p className="text-[10px] text-danger-600">Failed to update profile. Please try again.</p>
            )}
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs max-w-lg space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Key className="h-4 w-4" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="pw-current" className="block text-[10px] font-semibold text-neutral-600 mb-1">Current Password</label>
              <input
                id="pw-current"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="pw-new" className="block text-[10px] font-semibold text-neutral-600 mb-1">New Password</label>
              <input
                id="pw-new"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="pw-confirm" className="block text-[10px] font-semibold text-neutral-600 mb-1">Confirm New Password</label>
              <input
                id="pw-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {passwordError && (
              <p className="text-[10px] text-danger-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {passwordError}
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="text-xs px-4 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {changePassword.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Change Password
              </button>
              {passwordSaved && (
                <span className="text-xs text-success flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Password updated
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Laptop className="h-4 w-4" /> Active Sessions
          </h2>
          {sessionsLoading ? (
            <p className="text-xs text-neutral-400">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-neutral-400 italic">No active sessions found.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    session.isCurrent
                      ? 'border-primary-200 bg-primary-50/40'
                      : 'border-neutral-100 bg-neutral-50/40'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                      {session.isCurrent && (
                        <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">
                          Current
                        </span>
                      )}
                      {session.ipAddress}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate max-w-xs">{session.userAgent}</p>
                    <p className="text-[10px] text-neutral-400">
                      Last active: {new Date(session.lastActiveAt).toLocaleString()}
                    </p>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => {
                        if (confirm('Revoke this session?')) revokeSession.mutate(session.id);
                      }}
                      disabled={revokeSession.isPending}
                      className="text-[10px] font-semibold text-danger-600 hover:text-danger-800 px-2 py-1 rounded hover:bg-danger-50 disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
