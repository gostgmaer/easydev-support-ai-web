'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Settings, Image, Clock, ShieldAlert, Sliders, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = React.useState<'general' | 'branding' | 'business-hours' | 'holidays' | 'security' | 'feature-flags' | 'usage-limits'>('general');

  // Form states
  const [timezone, setTimezone] = React.useState('UTC-5');
  const [primaryColor, setPrimaryColor] = React.useState('#3b82f6');
  const [sessionTimeout, setSessionTimeout] = React.useState(30);

  React.useEffect(() => {
    if (pathname.includes('/branding')) {
      setActiveTab('branding');
    } else if (pathname.includes('/business-hours')) {
      setActiveTab('business-hours');
    } else if (pathname.includes('/holidays')) {
      setActiveTab('holidays');
    } else if (pathname.includes('/security')) {
      setActiveTab('security');
    } else if (pathname.includes('/feature-flags')) {
      setActiveTab('feature-flags');
    } else if (pathname.includes('/usage-limits')) {
      setActiveTab('usage-limits');
    } else {
      setActiveTab('general');
    }
  }, [pathname]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'general') {
      router.push('/settings');
    } else {
      router.push(`/settings/${tab}`);
    }
  };

  const handleSaveSettings = () => {
    alert('Tenant settings saved successfully.');
  };

  return (
    <div className="space-y-6" role="region" aria-label="Settings configuration console">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">Platform Settings</h1>
          <p className="text-xs text-neutral-500">Configure business hours, security requirements, tenant branding presets, and active feature flags.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-neutral-100 p-1 rounded-md text-xs font-bold self-start gap-1">
          {(['general', 'branding', 'business-hours', 'holidays', 'security', 'feature-flags', 'usage-limits'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-2.5 py-1.5 rounded-md capitalize transition ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Settings viewport */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs min-h-[300px]">
        {/* 1. GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="max-w-xl space-y-6 text-xs text-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
              <Settings className="h-4 w-4 text-primary-500" />
              <span>General Configurations</span>
            </h2>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="general-timezone" className="font-semibold text-neutral-600">Default Support Timezone</label>
              <select
                id="general-timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="UTC-5">EST (America/New_York)</option>
                <option value="UTC-8">PST (America/Los_Angeles)</option>
                <option value="UTC+0">GMT (London/Dublin)</option>
              </select>
            </div>

            <button
              onClick={handleSaveSettings}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition"
            >
              Save General Settings
            </button>
          </div>
        )}

        {/* 2. BRANDING TAB */}
        {activeTab === 'branding' && (
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

            <button
              onClick={handleSaveSettings}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition"
            >
              Update Brand Accent
            </button>
          </div>
        )}

        {/* 3. BUSINESS HOURS */}
        {activeTab === 'business-hours' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Weekly Shift Schedules</h2>
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 text-xs space-y-2">
              <span className="font-bold text-neutral-800 block">Mon - Fri shifts</span>
              <span className="text-neutral-500 block">08:00 AM - 05:00 PM EST</span>
            </div>
          </div>
        )}

        {/* 4. HOLIDAYS */}
        {activeTab === 'holidays' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Scheduled Holiday Breaks</h2>
            <p className="text-xs text-neutral-400 italic">No scheduled holiday closures registered for this quarter.</p>
          </div>
        )}

        {/* 5. SECURITY */}
        {activeTab === 'security' && (
          <div className="max-w-xl space-y-6 text-xs text-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
              <ShieldAlert className="h-4 w-4 text-danger animate-pulse" />
              <span>Access & Authentication Policies</span>
            </h2>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="security-timeout" className="font-semibold text-neutral-600">Idle Session Inactivity Timeout (minutes)</label>
              <input
                id="security-timeout"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition"
            >
              Update Security Policies
            </button>
          </div>
        )}

        {/* 6. FEATURE FLAGS */}
        {activeTab === 'feature-flags' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Active Governance Features</h2>
            
            <div className="divide-y divide-neutral-100 text-xs">
              <div className="flex justify-between items-center py-3">
                <div>
                  <span className="font-bold text-neutral-800 block">AI Deflection Auto-Pilot</span>
                  <span className="text-neutral-400 mt-0.5 block">Enable AI agent to automatically resolve high confidence tickets.</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-success bg-success/15 px-2 py-0.5 rounded">Active</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <span className="font-bold text-neutral-800 block">WhatsApp Integration Gate</span>
                  <span className="text-neutral-400 mt-0.5 block">Expose WhatsApp channels in configuration tabs.</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-success bg-success/15 px-2 py-0.5 rounded">Active</span>
              </div>
            </div>
          </div>
        )}

        {/* 7. USAGE LIMITS */}
        {activeTab === 'usage-limits' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Throttling Limits</h2>
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 text-xs space-y-2">
              <span className="font-bold text-neutral-800 block">Outbound Webhooks Throttle</span>
              <span className="text-neutral-500 block">Max 100 requests per minute per target endpoint.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
