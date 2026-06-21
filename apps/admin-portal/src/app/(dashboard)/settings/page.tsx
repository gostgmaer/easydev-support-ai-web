'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Settings, Image, Clock, ShieldAlert, Trash2, Plus } from 'lucide-react';
import {
  useTenantSettings,
  useUpdateTenantSettings,
  useBranding,
  useUpdateBranding,
  useBusinessHours,
  useSaveBusinessHours,
  useHolidays,
  useSaveHoliday,
  useDeleteHoliday,
  useSecuritySettings,
  useUpdateSecuritySettings,
  useFeatureFlags,
  useSaveFeatureFlag,
  useUsageLimits,
  useUpdateUsageLimits,
} from '@/hooks/useAdminQueries';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Tab = 'general' | 'branding' | 'business-hours' | 'holidays' | 'security' | 'feature-flags' | 'usage-limits';
const TABS: Tab[] = ['general', 'branding', 'business-hours', 'holidays', 'security', 'feature-flags', 'usage-limits'];

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = React.useState<Tab>('general');

  React.useEffect(() => {
    const match = TABS.find((t) => t !== 'general' && pathname.includes(`/${t}`));
    setActiveTab(match ?? 'general');
  }, [pathname]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.push(tab === 'general' ? '/settings' : `/settings/${tab}`);
  };

  return (
    <div className="space-y-6" role="region" aria-label="Settings configuration console">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Platform Settings</h1>
          <p className="text-xs text-neutral-500">Configure business hours, security requirements, tenant branding presets, and active feature flags.</p>
        </div>

        <div className="flex flex-wrap bg-neutral-100 p-1 rounded-md text-xs font-bold self-start gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-2.5 py-1.5 rounded-md capitalize transition ${
                activeTab === tab ? 'bg-white text-primary-600 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs min-h-[300px]">
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'branding' && <BrandingTab />}
        {activeTab === 'business-hours' && <BusinessHoursTab />}
        {activeTab === 'holidays' && <HolidaysTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'feature-flags' && <FeatureFlagsTab />}
        {activeTab === 'usage-limits' && <UsageLimitsTab />}
      </div>
    </div>
  );
}

function GeneralTab() {
  const { data: settings, isLoading } = useTenantSettings();
  const updateMutation = useUpdateTenantSettings();
  const [timezone, setTimezone] = React.useState('');
  const [supportEmail, setSupportEmail] = React.useState('');

  React.useEffect(() => {
    if (!settings) return;
    setTimezone(settings.timezone || '');
    setSupportEmail(settings.supportEmail || '');
  }, [settings]);

  if (isLoading) return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading...</p>;

  return (
    <div className="max-w-xl space-y-6 text-xs text-neutral-800">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
        <Settings className="h-4 w-4 text-primary-500" />
        <span>General Configuration</span>
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="general-timezone" className="font-semibold text-neutral-600">Default Support Timezone</label>
        <input
          id="general-timezone"
          type="text"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="e.g. America/New_York"
          className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="general-support-email" className="font-semibold text-neutral-600">Support Email</label>
        <input
          id="general-support-email"
          type="email"
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <button
        onClick={() => updateMutation.mutate({ timezone, supportEmail })}
        disabled={updateMutation.isPending}
        className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
      >
        {updateMutation.isPending ? 'Saving...' : 'Save General Settings'}
      </button>
    </div>
  );
}

function BrandingTab() {
  const { data: branding, isLoading } = useBranding();
  const updateMutation = useUpdateBranding();
  const [primaryColor, setPrimaryColor] = React.useState('#3b82f6');
  const [logoUrl, setLogoUrl] = React.useState('');

  React.useEffect(() => {
    if (!branding) return;
    setPrimaryColor(branding.primaryColor || '#3b82f6');
    setLogoUrl(branding.logoUrl || '');
  }, [branding]);

  if (isLoading) return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading...</p>;

  return (
    <div className="max-w-xl space-y-6 text-xs text-neutral-800">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
        <Image className="h-4 w-4 text-cyan-500" />
        <span>Tenant Theme Customizations</span>
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="branding-color" className="font-semibold text-neutral-600">Primary Brand Accent Color</label>
        <div className="flex gap-3">
          <input
            id="branding-color"
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-10 w-12 border border-neutral-200 rounded p-0.5 cursor-pointer"
          />
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="border border-neutral-200 rounded px-3 py-2 bg-white text-neutral-800 text-xs w-28"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="branding-logo" className="font-semibold text-neutral-600">Logo URL</label>
        <input
          id="branding-logo"
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
          className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <button
        onClick={() => updateMutation.mutate({ primaryColor, logoUrl })}
        disabled={updateMutation.isPending}
        className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
      >
        {updateMutation.isPending ? 'Saving...' : 'Update Branding'}
      </button>
    </div>
  );
}

function BusinessHoursTab() {
  const { data: hours = [], isLoading } = useBusinessHours();
  const saveMutation = useSaveBusinessHours();
  const [dayOfWeek, setDayOfWeek] = React.useState(1);
  const [startTime, setStartTime] = React.useState('09:00:00');
  const [endTime, setEndTime] = React.useState('17:00:00');

  if (isLoading) return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading...</p>;

  return (
    <div className="space-y-4 text-xs">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Weekly Shift Schedules</h2>

      {hours.length > 0 ? (
        <div className="divide-y divide-neutral-100">
          {hours.map((h) => (
            <div key={h.id} className="flex justify-between items-center py-2.5">
              <span className="font-bold text-neutral-800">{DAY_NAMES[h.dayOfWeek]}</span>
              <span className="text-neutral-500">
                {h.isOpen ? `${h.startTime} - ${h.endTime} (${h.timezone})` : 'Closed'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-400 italic">No business hours configured yet.</p>
      )}

      <div className="flex items-end gap-2 pt-3 border-t border-neutral-100">
        <div className="flex flex-col gap-1">
          <label htmlFor="bh-day" className="font-semibold text-neutral-600">Day</label>
          <select id="bh-day" value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className="border border-neutral-200 rounded p-2 bg-white">
            {DAY_NAMES.map((name, idx) => (
              <option key={idx} value={idx}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="bh-start" className="font-semibold text-neutral-600">Start</label>
          <input id="bh-start" type="time" value={startTime.slice(0, 5)} onChange={(e) => setStartTime(`${e.target.value}:00`)} className="border border-neutral-200 rounded p-2 bg-white" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="bh-end" className="font-semibold text-neutral-600">End</label>
          <input id="bh-end" type="time" value={endTime.slice(0, 5)} onChange={(e) => setEndTime(`${e.target.value}:00`)} className="border border-neutral-200 rounded p-2 bg-white" />
        </div>
        <button
          onClick={() => saveMutation.mutate({ dayOfWeek, startTime, endTime, isOpen: true, timezone: 'UTC' })}
          disabled={saveMutation.isPending}
          className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-3 rounded transition disabled:opacity-50 h-[34px]"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function HolidaysTab() {
  const { data: holidays = [], isLoading } = useHolidays();
  const saveMutation = useSaveHoliday();
  const deleteMutation = useDeleteHoliday();
  const [holidayName, setHolidayName] = React.useState('');
  const [holidayDate, setHolidayDate] = React.useState('');

  if (isLoading) return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading...</p>;

  return (
    <div className="space-y-4 text-xs">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Scheduled Holiday Breaks</h2>

      {holidays.length > 0 ? (
        <div className="divide-y divide-neutral-100">
          {holidays.map((h) => (
            <div key={h.id} className="flex justify-between items-center py-2.5">
              <div>
                <span className="font-bold text-neutral-800 block">{h.holidayName}</span>
                <span className="text-neutral-400">{new Date(h.holidayDate).toLocaleDateString()}{h.isRecurring && ' • Recurring'}</span>
              </div>
              <button onClick={() => deleteMutation.mutate(h.id)} className="text-neutral-400 hover:text-danger p-1" aria-label={`Delete ${h.holidayName}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-400 italic">No scheduled holiday closures registered.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!holidayName.trim() || !holidayDate) return;
          saveMutation.mutate({ holidayName, holidayDate, isRecurring: false }, {
            onSuccess: () => { setHolidayName(''); setHolidayDate(''); },
          });
        }}
        className="flex items-end gap-2 pt-3 border-t border-neutral-100"
      >
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="holiday-name" className="font-semibold text-neutral-600">Holiday Name</label>
          <input id="holiday-name" required value={holidayName} onChange={(e) => setHolidayName(e.target.value)} className="border border-neutral-200 rounded p-2 bg-white" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="holiday-date" className="font-semibold text-neutral-600">Date</label>
          <input id="holiday-date" type="date" required value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} className="border border-neutral-200 rounded p-2 bg-white" />
        </div>
        <button type="submit" disabled={saveMutation.isPending} className="flex items-center gap-1 bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-3 rounded transition disabled:opacity-50 h-[34px]">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </form>
    </div>
  );
}

function SecurityTab() {
  const { data: settings, isLoading } = useSecuritySettings();
  const updateMutation = useUpdateSecuritySettings();
  const [sessionTimeout, setSessionTimeout] = React.useState(30);
  const [mfaRequired, setMfaRequired] = React.useState(false);

  React.useEffect(() => {
    if (!settings) return;
    setSessionTimeout(settings.sessionTimeout ?? 30);
    setMfaRequired(settings.mfaRequired ?? false);
  }, [settings]);

  if (isLoading) return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading...</p>;

  return (
    <div className="max-w-xl space-y-6 text-xs text-neutral-800">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
        <ShieldAlert className="h-4 w-4 text-danger" />
        <span>Access & Authentication Policies</span>
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="security-timeout" className="font-semibold text-neutral-600">Idle Session Inactivity Timeout (seconds)</label>
        <input
          id="security-timeout"
          type="number"
          value={sessionTimeout}
          onChange={(e) => setSessionTimeout(Number(e.target.value))}
          className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 flex justify-between items-center">
        <span className="font-bold text-neutral-800">Require Multi-Factor Authentication</span>
        <input type="checkbox" checked={mfaRequired} onChange={(e) => setMfaRequired(e.target.checked)} className="h-4.5 w-4.5 rounded text-primary-500" aria-label="Require MFA" />
      </div>

      <button
        onClick={() => updateMutation.mutate({ sessionTimeout, mfaRequired })}
        disabled={updateMutation.isPending}
        className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
      >
        {updateMutation.isPending ? 'Saving...' : 'Update Security Policies'}
      </button>
    </div>
  );
}

function FeatureFlagsTab() {
  const { data: flags = [], isLoading } = useFeatureFlags();
  const saveMutation = useSaveFeatureFlag();

  if (isLoading) return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading...</p>;

  return (
    <div className="space-y-4 text-xs">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Feature Flags</h2>

      {flags.length > 0 ? (
        <div className="divide-y divide-neutral-100">
          {flags.map((flag) => (
            <div key={flag.id} className="flex justify-between items-center py-3">
              <div>
                <span className="font-bold text-neutral-800 block">{flag.featureKey}</span>
                <span className="text-neutral-400 mt-0.5 block">{flag.rolloutPercentage}% rollout</span>
              </div>
              <button
                onClick={() => saveMutation.mutate({ featureKey: flag.featureKey, enabled: !flag.enabled, rolloutPercentage: flag.rolloutPercentage })}
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${flag.enabled ? 'text-success bg-success/15' : 'text-neutral-500 bg-neutral-100'}`}
              >
                {flag.enabled ? 'Active' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-400 italic">No feature flags configured for this tenant.</p>
      )}
    </div>
  );
}

function UsageLimitsTab() {
  const { data: limits, isLoading } = useUsageLimits();
  const updateMutation = useUpdateUsageLimits();
  const [maxAgents, setMaxAgents] = React.useState<number | ''>('');
  const [maxConversations, setMaxConversations] = React.useState<number | ''>('');

  React.useEffect(() => {
    if (!limits) return;
    setMaxAgents(limits.maxAgents ?? '');
    setMaxConversations(limits.maxConversations ?? '');
  }, [limits]);

  if (isLoading) return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading...</p>;

  return (
    <div className="max-w-xl space-y-6 text-xs text-neutral-800">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Throttling Limits</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="limit-agents" className="font-semibold text-neutral-600">Max Concurrent Agents</label>
          <input
            id="limit-agents"
            type="number"
            value={maxAgents}
            onChange={(e) => setMaxAgents(e.target.value === '' ? '' : Number(e.target.value))}
            className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="limit-conversations" className="font-semibold text-neutral-600">Max Conversations</label>
          <input
            id="limit-conversations"
            type="number"
            value={maxConversations}
            onChange={(e) => setMaxConversations(e.target.value === '' ? '' : Number(e.target.value))}
            className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <button
        onClick={() => updateMutation.mutate({
          maxAgents: maxAgents === '' ? undefined : maxAgents,
          maxConversations: maxConversations === '' ? undefined : maxConversations,
        })}
        disabled={updateMutation.isPending}
        className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
      >
        {updateMutation.isPending ? 'Saving...' : 'Update Limits'}
      </button>
    </div>
  );
}
