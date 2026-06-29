'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Settings, Image, Clock, ShieldAlert, Trash2, Plus, Building2, AlertTriangle, Copy, Eye, EyeOff, RefreshCw, Puzzle, Bell, Timer, Bot } from 'lucide-react';
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
  useProvisionTenant,
  useWidgetAdminConfig,
  useRotateWidgetIdentitySecret,
  useWidgetSettings,
  useUpdateWidgetSettings,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useSlaSettings,
  useUpdateSlaSettings,
  useAiSettings,
  useUpdateAiSettings,
  useChannelSettings,
  useUpdateChannelSettings,
} from '@/hooks/useAdminQueries';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Tab = 'general' | 'branding' | 'business-hours' | 'holidays' | 'security' | 'feature-flags' | 'usage-limits' | 'notifications' | 'sla' | 'provisioning' | 'widget' | 'ai-settings' | 'channel-settings';
const TABS: Tab[] = ['general', 'branding', 'business-hours', 'holidays', 'security', 'feature-flags', 'usage-limits', 'notifications', 'sla', 'provisioning', 'widget', 'ai-settings', 'channel-settings'];

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
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'sla' && <SlaTab />}
        {activeTab === 'provisioning' && <ProvisioningTab />}
        {activeTab === 'widget' && <WidgetTab />}
        {activeTab === 'ai-settings' && <AiTab />}
        {activeTab === 'channel-settings' && <ChannelSettingsTab />}
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

const PLANS = ['STARTER', 'GROWTH', 'ENTERPRISE'] as const;

// The tenant itself is created upstream in EasyDev IAM (TenantGuard requires
// a valid tenant-scoped JWT on every request, including this one) - this
// form provisions this product's own per-tenant resources for a tenant that
// already exists in IAM: default settings, branding, plan feature flags, and
// the first API key. Intended as a one-time onboarding action.
function ProvisioningTab() {
  const provisionMutation = useProvisionTenant();

  const [name, setName] = React.useState('');
  const [plan, setPlan] = React.useState<typeof PLANS[number]>('STARTER');
  const [adminEmail, setAdminEmail] = React.useState('');
  const [adminName, setAdminName] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState('');
  const [primaryColor, setPrimaryColor] = React.useState('');
  const [timezone, setTimezone] = React.useState('');
  const [locale, setLocale] = React.useState('');
  const [result, setResult] = React.useState<{ apiKey: string; plan: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !adminEmail.trim() || !adminName.trim()) return;

    provisionMutation.mutate(
      {
        name: name.trim(),
        plan,
        adminEmail: adminEmail.trim(),
        adminName: adminName.trim(),
        logoUrl: logoUrl.trim() || undefined,
        primaryColor: primaryColor.trim() || undefined,
        timezone: timezone.trim() || undefined,
        locale: locale.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          setResult({ apiKey: data.apiKey, plan: data.plan });
        },
      },
    );
  };

  return (
    <div className="max-w-xl space-y-6 text-xs text-neutral-800">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
        <Building2 className="h-4 w-4 text-primary-500" />
        <span>Tenant Onboarding</span>
      </h2>
      <p className="text-neutral-400">
        Run this once to set up default settings, branding, plan feature flags, and an initial API key for this tenant.
      </p>

      {result && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 space-y-2">
          <p className="font-bold text-warning flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            <span>Tenant provisioned on the {result.plan} plan - copy this API key now, it will not be shown again</span>
          </p>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded p-2 font-mono text-neutral-800">
            <span className="flex-1 break-all">{result.apiKey}</span>
            <button
              onClick={() => navigator.clipboard.writeText(result.apiKey)}
              className="p-1 hover:bg-neutral-100 rounded shrink-0"
              aria-label="Copy API key"
            >
              <Copy className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          </div>
          <button onClick={() => setResult(null)} className="text-neutral-500 hover:text-neutral-700 font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {provisionMutation.isError && (
        <p className="text-danger-600 bg-danger/10 border border-danger/20 rounded p-2">
          Provisioning failed. This tenant may already have default settings configured.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prov-name" className="font-semibold text-neutral-600">Tenant Name</label>
          <input
            id="prov-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Corp"
            className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="prov-plan" className="font-semibold text-neutral-600">Plan</label>
          <select
            id="prov-plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value as typeof PLANS[number])}
            className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
          >
            {PLANS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prov-admin-name" className="font-semibold text-neutral-600">Admin Name</label>
            <input
              id="prov-admin-name"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prov-admin-email" className="font-semibold text-neutral-600">Admin Email</label>
            <input
              id="prov-admin-email"
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prov-logo" className="font-semibold text-neutral-600">Logo URL (optional)</label>
            <input
              id="prov-logo"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prov-color" className="font-semibold text-neutral-600">Primary Color (optional)</label>
            <input
              id="prov-color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#6366f1"
              className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prov-timezone" className="font-semibold text-neutral-600">Timezone (optional)</label>
            <input
              id="prov-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="UTC"
              className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prov-locale" className="font-semibold text-neutral-600">Locale (optional)</label>
            <input
              id="prov-locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              placeholder="en"
              className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={provisionMutation.isPending}
          className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {provisionMutation.isPending ? 'Provisioning...' : 'Provision Tenant'}
        </button>
      </form>
    </div>
  );
}

function NotificationsTab() {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateMutation = useUpdateNotificationSettings();
  const [form, setForm] = React.useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    webhookEnabled: false,
    digestEnabled: false,
  });

  React.useEffect(() => {
    if (!settings) return;
    setForm({
      emailEnabled: settings.emailEnabled ?? true,
      smsEnabled: settings.smsEnabled ?? false,
      pushEnabled: settings.pushEnabled ?? true,
      webhookEnabled: settings.webhookEnabled ?? false,
      digestEnabled: settings.digestEnabled ?? false,
    });
  }, [settings]);

  if (isLoading) return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading...</p>;

  return (
    <div className="max-w-xl space-y-6 text-xs text-neutral-800">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
        <Bell className="h-4 w-4 text-primary-500" />
        <span>Notification Channels</span>
      </h2>

      <div className="space-y-3">
        {([
          { key: 'emailEnabled', label: 'Email Notifications' },
          { key: 'smsEnabled', label: 'SMS Notifications' },
          { key: 'pushEnabled', label: 'Push Notifications' },
          { key: 'webhookEnabled', label: 'Webhook Notifications' },
          { key: 'digestEnabled', label: 'Daily/Weekly Digest' },
        ] as const).map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between p-3 border border-neutral-100 rounded-lg bg-neutral-50/40">
            <span className="font-semibold text-neutral-700">{label}</span>
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
              className="h-4 w-4 rounded text-primary-500"
              aria-label={label}
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => updateMutation.mutate(form)}
        disabled={updateMutation.isPending}
        className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
      >
        {updateMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
      </button>
    </div>
  );
}

function SlaTab() {
  const { data: settings, isLoading } = useSlaSettings();
  const updateMutation = useUpdateSlaSettings();
  const [form, setForm] = React.useState({
    firstResponseSlaMinutes: 60,
    resolutionSlaMinutes: 1440,
    escalationSlaMinutes: 240,
    businessHoursOnly: true,
  });

  React.useEffect(() => {
    if (!settings) return;
    setForm({
      firstResponseSlaMinutes: settings.responseTimeTarget ? Math.round(settings.responseTimeTarget / 60) : 60,
      resolutionSlaMinutes: settings.resolutionTimeTarget ? Math.round(settings.resolutionTimeTarget / 60) : 1440,
      escalationSlaMinutes: settings.escalationTimeTarget ? Math.round(settings.escalationTimeTarget / 60) : 240,
      businessHoursOnly: settings.businessHoursOnly ?? true,
    });
  }, [settings]);

  if (isLoading) return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading...</p>;

  return (
    <div className="max-w-xl space-y-6 text-xs text-neutral-800">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
        <Timer className="h-4 w-4 text-warning" />
        <span>SLA Configuration</span>
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sla-first-response" className="font-semibold text-neutral-600">First Response (minutes)</label>
          <input
            id="sla-first-response"
            type="number"
            min={1}
            value={form.firstResponseSlaMinutes}
            onChange={(e) => setForm((f) => ({ ...f, firstResponseSlaMinutes: Number(e.target.value) }))}
            className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sla-resolution" className="font-semibold text-neutral-600">Resolution (minutes)</label>
          <input
            id="sla-resolution"
            type="number"
            min={1}
            value={form.resolutionSlaMinutes}
            onChange={(e) => setForm((f) => ({ ...f, resolutionSlaMinutes: Number(e.target.value) }))}
            className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sla-escalation" className="font-semibold text-neutral-600">Escalation Alert (minutes)</label>
          <input
            id="sla-escalation"
            type="number"
            min={1}
            value={form.escalationSlaMinutes}
            onChange={(e) => setForm((f) => ({ ...f, escalationSlaMinutes: Number(e.target.value) }))}
            className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 border border-neutral-100 rounded-lg bg-neutral-50/40">
          <span className="font-semibold text-neutral-700">SLA only counts during business hours</span>
          <input
            type="checkbox"
            checked={form.businessHoursOnly}
            onChange={(e) => setForm((f) => ({ ...f, businessHoursOnly: e.target.checked }))}
            className="h-4 w-4 rounded text-primary-500"
            aria-label="Business hours only"
          />
        </div>
      </div>

      <button
        onClick={() => updateMutation.mutate({
          responseTimeTarget: form.firstResponseSlaMinutes * 60,
          resolutionTimeTarget: form.resolutionSlaMinutes * 60,
          escalationTimeTarget: form.escalationSlaMinutes * 60,
          businessHoursOnly: form.businessHoursOnly
        })}
        disabled={updateMutation.isPending}
        className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
      >
        {updateMutation.isPending ? 'Saving...' : 'Save SLA Settings'}
      </button>
    </div>
  );
}

function WidgetTab() {
  const { data: config, isLoading: isConfigLoading } = useWidgetAdminConfig();
  const rotateMutation = useRotateWidgetIdentitySecret();
  const [revealed, setRevealed] = React.useState(false);

  const { data: settings, isLoading: isSettingsLoading } = useWidgetSettings();
  const updateMutation = useUpdateWidgetSettings();

  const [form, setForm] = React.useState({
    widgetName: '',
    widgetColor: '',
    widgetPosition: '',
    welcomeMessage: '',
    offlineMessage: '',
    avatarUrl: '',
    customCss: '',
    customJs: '',
  });

  React.useEffect(() => {
    if (!settings) return;
    setForm({
      widgetName: settings.widgetName || '',
      widgetColor: settings.widgetColor || '#000000',
      widgetPosition: settings.widgetPosition || 'BOTTOM_RIGHT',
      welcomeMessage: settings.welcomeMessage || '',
      offlineMessage: settings.offlineMessage || '',
      avatarUrl: settings.avatarUrl || '',
      customCss: settings.customCss || '',
      customJs: settings.customJs || '',
    });
  }, [settings]);

  const handleRotate = () => {
    if (confirm('Rotate the identity verification secret? Any signatures your backend has already computed with the old secret will stop working immediately.')) {
      rotateMutation.mutate(undefined, { onSuccess: () => setRevealed(true) });
    }
  };

  if (isConfigLoading || isSettingsLoading) {
    return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading widget configuration...</p>;
  }

  return (
    <div className="max-w-xl space-y-8 text-xs text-neutral-800">
      <div className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
          <Puzzle className="h-4 w-4 text-primary-500" />
          <span>Widget Display Settings</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-600">Widget Name</label>
            <input
              type="text"
              value={form.widgetName}
              onChange={(e) => setForm(f => ({ ...f, widgetName: e.target.value }))}
              className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
              placeholder="Live Chat"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-600">Widget Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.widgetColor}
                onChange={(e) => setForm(f => ({ ...f, widgetColor: e.target.value }))}
                className="h-10 w-10 p-1 bg-white border border-neutral-200 rounded cursor-pointer"
              />
              <input
                type="text"
                value={form.widgetColor}
                onChange={(e) => setForm(f => ({ ...f, widgetColor: e.target.value }))}
                className="flex-1 border border-neutral-200 rounded p-2.5 bg-white font-mono uppercase focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-600">Position</label>
            <select
              value={form.widgetPosition}
              onChange={(e) => setForm(f => ({ ...f, widgetPosition: e.target.value }))}
              className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="BOTTOM_RIGHT">Bottom Right</option>
              <option value="BOTTOM_LEFT">Bottom Left</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-600">Avatar URL</label>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={(e) => setForm(f => ({ ...f, avatarUrl: e.target.value }))}
              className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com/avatar.png"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-neutral-600">Welcome Message</label>
          <textarea
            value={form.welcomeMessage}
            onChange={(e) => setForm(f => ({ ...f, welcomeMessage: e.target.value }))}
            rows={2}
            className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            placeholder="Hi there! How can we help you today?"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-neutral-600">Offline Message</label>
          <textarea
            value={form.offlineMessage}
            onChange={(e) => setForm(f => ({ ...f, offlineMessage: e.target.value }))}
            rows={2}
            className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            placeholder="We are currently offline. Leave a message."
          />
        </div>

        <button
          type="button"
          onClick={() => updateMutation.mutate(form)}
          disabled={updateMutation.isPending}
          className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Display Settings'}
        </button>
      </div>

      <div className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
          <Puzzle className="h-4 w-4 text-primary-500" />
          <span>Widget Identity Verification</span>
        </h2>
        <p className="text-neutral-400">
          If you identify logged-in customers to the chat widget, your own backend must sign each identity with this
          secret (HMAC SHA256 of <code className="bg-neutral-100 px-1 rounded">externalUserId:email</code>) before
          passing it to the widget - never expose this secret in browser code.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-neutral-600">Verification Secret</label>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded p-2.5 font-mono text-neutral-800">
            <span className="flex-1 break-all">
              {revealed ? config?.identityVerificationSecret : '•'.repeat(48)}
            </span>
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="p-1 hover:bg-neutral-100 rounded shrink-0"
              aria-label={revealed ? 'Hide secret' : 'Reveal secret'}
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5 text-neutral-500" /> : <Eye className="h-3.5 w-3.5 text-neutral-500" />}
            </button>
            {revealed && (
              <button
                type="button"
                onClick={() => config?.identityVerificationSecret && navigator.clipboard.writeText(config.identityVerificationSecret)}
                className="p-1 hover:bg-neutral-100 rounded shrink-0"
                aria-label="Copy secret"
              >
                <Copy className="h-3.5 w-3.5 text-neutral-500" />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleRotate}
          disabled={rotateMutation.isPending}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{rotateMutation.isPending ? 'Rotating...' : 'Rotate Secret'}</span>
        </button>
      </div>
    </div>
  );
}

function AiTab() {
  const { data: settings, isLoading } = useAiSettings();
  const updateMutation = useUpdateAiSettings();

  const [form, setForm] = React.useState({
    defaultAgent: '',
    confidenceThreshold: 0.7,
    escalationThreshold: 0.4,
    allowedLanguages: 'en',
    defaultLanguage: 'en',
    autoResponseEnabled: true,
    autoEscalationEnabled: true,
    costLimitDaily: 50,
    costLimitMonthly: 1000,
  });

  React.useEffect(() => {
    if (!settings) return;
    setForm({
      defaultAgent: settings.defaultAgent || '',
      confidenceThreshold: settings.confidenceThreshold ?? 0.7,
      escalationThreshold: settings.escalationThreshold ?? 0.4,
      allowedLanguages: settings.allowedLanguages?.join(', ') || 'en',
      defaultLanguage: settings.defaultLanguage || 'en',
      autoResponseEnabled: settings.autoResponseEnabled ?? true,
      autoEscalationEnabled: settings.autoEscalationEnabled ?? true,
      costLimitDaily: settings.costLimitDaily ?? 50,
      costLimitMonthly: settings.costLimitMonthly ?? 1000,
    });
  }, [settings]);

  if (isLoading) {
    return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading AI settings...</p>;
  }

  return (
    <div className="max-w-xl space-y-6 text-xs text-neutral-800">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
        <Bot className="h-4 w-4 text-primary-500" />
        <span>AI Agent & Automation Settings</span>
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-600">Default AI Agent ID</label>
            <input
              type="text"
              value={form.defaultAgent}
              onChange={(e) => setForm(f => ({ ...f, defaultAgent: e.target.value }))}
              className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
              placeholder="agent_xxx"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-600">Default Language</label>
            <input
              type="text"
              value={form.defaultLanguage}
              onChange={(e) => setForm(f => ({ ...f, defaultLanguage: e.target.value }))}
              className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-600">Confidence Threshold (0.0 - 1.0)</label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={form.confidenceThreshold}
              onChange={(e) => setForm(f => ({ ...f, confidenceThreshold: parseFloat(e.target.value) || 0 }))}
              className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-600">Escalation Threshold (0.0 - 1.0)</label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={form.escalationThreshold}
              onChange={(e) => setForm(f => ({ ...f, escalationThreshold: parseFloat(e.target.value) || 0 }))}
              className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-neutral-600">Allowed Languages (comma separated ISO codes)</label>
          <input
            type="text"
            value={form.allowedLanguages}
            onChange={(e) => setForm(f => ({ ...f, allowedLanguages: e.target.value }))}
            className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            placeholder="en, es, fr, de"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-600">Daily Cost Limit ($)</label>
            <input
              type="number"
              min="0"
              value={form.costLimitDaily}
              onChange={(e) => setForm(f => ({ ...f, costLimitDaily: parseInt(e.target.value) || 0 }))}
              className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-600">Monthly Cost Limit ($)</label>
            <input
              type="number"
              min="0"
              value={form.costLimitMonthly}
              onChange={(e) => setForm(f => ({ ...f, costLimitMonthly: parseInt(e.target.value) || 0 }))}
              className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border border-neutral-100 rounded-lg bg-neutral-50/40">
          <span className="font-semibold text-neutral-700">Enable Auto-Response (AI answers directly)</span>
          <input
            type="checkbox"
            checked={form.autoResponseEnabled}
            onChange={(e) => setForm((f) => ({ ...f, autoResponseEnabled: e.target.checked }))}
            className="h-4 w-4 rounded text-primary-500"
          />
        </div>
        <div className="flex items-center justify-between p-3 border border-neutral-100 rounded-lg bg-neutral-50/40">
          <span className="font-semibold text-neutral-700">Enable Auto-Escalation (fallback to human)</span>
          <input
            type="checkbox"
            checked={form.autoEscalationEnabled}
            onChange={(e) => setForm((f) => ({ ...f, autoEscalationEnabled: e.target.checked }))}
            className="h-4 w-4 rounded text-primary-500"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            const payload = {
              ...form,
              allowedLanguages: form.allowedLanguages.split(',').map(s => s.trim()).filter(Boolean)
            };
            updateMutation.mutate(payload);
          }}
          disabled={updateMutation.isPending}
          className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save AI Settings'}
        </button>
      </div>
    </div>
  );
}


function ChannelSettingsTab() {
  const { data: channels, isLoading } = useChannelSettings();
  const updateMutation = useUpdateChannelSettings();

  if (isLoading) {
    return <p className="text-xs text-neutral-400 animate-pulse py-8 text-center">Loading channels...</p>;
  }

  const channelList = channels || [];
  if (channelList.length === 0) {
    return <p className="text-xs text-neutral-400 py-8 text-center">No channels configured.</p>;
  }

  return (
    <div className="max-w-xl space-y-6 text-xs text-neutral-800">
      <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
        <Puzzle className="h-4 w-4 text-primary-500" />
        <span>Communication Channels</span>
      </h2>

      <div className="space-y-4">
        {channelList.map((channel) => (
          <div key={channel.channelType} className="border border-neutral-200 rounded-lg p-4 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-900 uppercase">{channel.channelType}</h3>
              <div className="flex items-center gap-2">
                <label className="text-neutral-600 font-semibold">Enabled</label>
                <input
                  type="checkbox"
                  checked={channel.enabled}
                  onChange={(e) => updateMutation.mutate({ ...channel, enabled: e.target.checked })}
                  className="h-4 w-4 rounded text-primary-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-2 border border-neutral-100 rounded bg-neutral-50/40">
                <span className="text-neutral-700">Business Hours Only</span>
                <input
                  type="checkbox"
                  checked={channel.businessHoursOnly}
                  onChange={(e) => updateMutation.mutate({ ...channel, businessHoursOnly: e.target.checked })}
                  className="h-4 w-4 rounded text-primary-500"
                />
              </div>
              <div className="flex items-center justify-between p-2 border border-neutral-100 rounded bg-neutral-50/40">
                <span className="text-neutral-700">Auto Assignment</span>
                <input
                  type="checkbox"
                  checked={channel.autoAssignmentEnabled}
                  onChange={(e) => updateMutation.mutate({ ...channel, autoAssignmentEnabled: e.target.checked })}
                  className="h-4 w-4 rounded text-primary-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

