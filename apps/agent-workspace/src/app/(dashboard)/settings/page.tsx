'use client';

import React, { useState } from 'react';
import { Settings, Keyboard, Bell, Cpu, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [autoClaim, setAutoClaim] = useState(true);
  const [enableAiDrafts, setEnableAiDrafts] = useState(true);
  const [desktopAlerts, setDesktopAlerts] = useState(true);

  // Keyboard shortcut data mapping
  const shortcuts = [
    { keys: 'G M', action: 'Go to My Inbox' },
    { keys: 'G U', action: 'Go to Unassigned Inbox' },
    { keys: 'G E', action: 'Go to Escalated Inbox' },
    { keys: 'G B', action: 'Go to Bookmarked list' },
    { keys: 'G S', action: 'Go to Snoozed list' },
    { keys: '⌘ K', action: 'Open Global Command Search Palette' },
    { keys: 'Enter', action: 'Send message (composer active)' },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-50 p-6 space-y-6 overflow-y-auto" role="region" aria-label="Settings page">
      {/* Settings Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-neutral-100 text-neutral-600 rounded-lg flex items-center justify-center">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900">Workspace Settings</h1>
            <p className="text-xs text-neutral-500">Configure global shortcuts, notification bounds, and AI assistant actions.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workspace Preferences Toggle checklist */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <Cpu className="h-4.5 w-4.5" />
            <span>Agent Workflow Controls</span>
          </h2>

          <div className="space-y-4 text-xs">
            {/* Auto Assign */}
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-neutral-800 block">Auto-Claim Handed-Off Conversations</span>
                <span className="text-neutral-500 block leading-normal">Automatically route and assign incoming Tier-2 escalations to your active list.</span>
              </div>
              <input
                type="checkbox"
                checked={autoClaim}
                onChange={() => setAutoClaim(!autoClaim)}
                className="h-4.5 w-4.5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                aria-label="Auto-Claim Handed-Off Conversations"
              />
            </div>

            {/* AI Draft Suggestion */}
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-neutral-800 block">Prefetch AI Drafts</span>
                <span className="text-neutral-500 block leading-normal">Instruct the AI Platform to pre-compile drafting replies for every new message.</span>
              </div>
              <input
                type="checkbox"
                checked={enableAiDrafts}
                onChange={() => setEnableAiDrafts(!enableAiDrafts)}
                className="h-4.5 w-4.5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                aria-label="Prefetch AI Drafts"
              />
            </div>

            {/* Desktop notifications */}
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-neutral-800 block">System Desktop Alerts</span>
                <span className="text-neutral-500 block leading-normal">Trigger operating system banner alerts on incoming critical ticket SLA limits.</span>
              </div>
              <input
                type="checkbox"
                checked={desktopAlerts}
                onChange={() => setDesktopAlerts(!desktopAlerts)}
                className="h-4.5 w-4.5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 cursor-pointer"
                aria-label="System Desktop Alerts"
              />
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Help Panel */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-100 pb-3">
            <Keyboard className="h-4.5 w-4.5" />
            <span>Shortcut Quick Reference</span>
          </h2>

          <div className="divide-y divide-neutral-100">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex justify-between items-center py-2.5 text-xs text-neutral-700">
                <span>{shortcut.action}</span>
                <kbd className="px-2 py-0.5 font-mono text-[10px] font-bold text-neutral-500 bg-neutral-50 border border-neutral-200 rounded shadow-2xs">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
