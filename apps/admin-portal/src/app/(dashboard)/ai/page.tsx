'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Cpu, Coins } from 'lucide-react';
import { useAiSettings, useUpdateAiSettings, useAnalyticsAiMetrics } from '@/hooks/useAdminQueries';

export default function AiPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: settings, isLoading } = useAiSettings();
  const updateMutation = useUpdateAiSettings();
  const { data: aiMetrics } = useAnalyticsAiMetrics('Last 30 Days');

  const [activeTab, setActiveTab] = React.useState<'agents' | 'workflows' | 'escalations' | 'costs'>('agents');

  // Local edit buffers, seeded from the real settings once loaded.
  const [confidencePct, setConfidencePct] = React.useState(70);
  const [escalationPct, setEscalationPct] = React.useState(40);
  const [autoResponse, setAutoResponse] = React.useState(true);
  const [autoEscalation, setAutoEscalation] = React.useState(true);
  const [costLimitMonthly, setCostLimitMonthly] = React.useState(0);

  React.useEffect(() => {
    if (!settings) return;
    setConfidencePct(Math.round(settings.confidenceThreshold * 100));
    setEscalationPct(Math.round(settings.escalationThreshold * 100));
    setAutoResponse(settings.autoResponseEnabled);
    setAutoEscalation(settings.autoEscalationEnabled);
    setCostLimitMonthly(settings.costLimitMonthly ?? 0);
  }, [settings]);

  React.useEffect(() => {
    if (pathname.includes('/workflows')) {
      setActiveTab('workflows');
    } else if (pathname.includes('/escalations')) {
      setActiveTab('escalations');
    } else if (pathname.includes('/costs')) {
      setActiveTab('costs');
    } else {
      setActiveTab('agents');
    }
  }, [pathname]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'agents') {
      router.push('/ai');
    } else {
      router.push(`/ai/${tab}`);
    }
  };

  if (isLoading) {
    return <p className="text-center text-xs text-neutral-400 animate-pulse py-12">Loading AI settings...</p>;
  }

  return (
    <div className="space-y-6" role="region" aria-label="AI Platform Configurator">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">AI Platform Configuration</h1>
          <p className="text-xs text-neutral-500">Tune confidence handoff bounds and monitor token spending.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-md text-xs font-bold self-start md:self-center gap-1">
          {(['agents', 'workflows', 'escalations', 'costs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md capitalize transition ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tab Body */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs min-h-[300px]">
        {/* 1. AGENTS TAB - auto-response confidence + on/off */}
        {activeTab === 'agents' && (
          <div className="max-w-xl space-y-6 text-xs text-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
              <Cpu className="h-4 w-4 text-primary-500" />
              <span>Auto-Response Tuning</span>
            </h2>

            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 flex justify-between items-center">
              <div>
                <span className="font-bold text-neutral-800 block">AI Auto-Response</span>
                <span className="text-neutral-500 mt-0.5 block">Let the AI reply automatically above the confidence threshold below.</span>
              </div>
              <input
                type="checkbox"
                checked={autoResponse}
                onChange={(e) => setAutoResponse(e.target.checked)}
                className="h-4.5 w-4.5 rounded text-primary-500"
                aria-label="AI Auto-Response"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center font-semibold text-neutral-600">
                <label htmlFor="ai-confidence-input">Auto-Response Confidence Threshold</label>
                <span className="text-primary-600 font-bold">{confidencePct}%</span>
              </div>
              <input
                id="ai-confidence-input"
                type="range"
                min="50"
                max="98"
                value={confidencePct}
                onChange={(e) => setConfidencePct(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <span className="text-[10px] text-neutral-400 block leading-normal">
                Suggested responses with confidence below this limit are held as agent drafts instead of auto-sent.
              </span>
            </div>

            <button
              onClick={() => updateMutation.mutate({ confidenceThreshold: confidencePct / 100, autoResponseEnabled: autoResponse })}
              disabled={updateMutation.isPending}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        )}

        {/* 2. WORKFLOWS TAB - language config (the AI automation workflows
            themselves live on the Workflows page; this tab covers AI-specific
            language settings, the other real field on this DTO). */}
        {activeTab === 'workflows' && (
          <div className="max-w-xl space-y-4 text-xs text-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Language Configuration</h2>
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50">
              <span className="font-bold text-neutral-800 block mb-1">Default Language</span>
              <span className="text-neutral-500">{settings?.defaultLanguage || 'en'}</span>
            </div>
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50">
              <span className="font-bold text-neutral-800 block mb-1">Allowed Languages</span>
              <span className="text-neutral-500">
                {settings?.allowedLanguages?.length ? settings.allowedLanguages.join(', ') : 'All languages allowed'}
              </span>
            </div>
            <p className="text-neutral-400 italic">Automation rule workflows are managed on the Workflows page.</p>
          </div>
        )}

        {/* 3. ESCALATION TAB */}
        {activeTab === 'escalations' && (
          <div className="max-w-xl space-y-6 text-xs text-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Escalation Handoff Criteria</h2>

            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 flex justify-between items-center">
              <div>
                <span className="font-bold text-neutral-800 block">Auto-Escalation</span>
                <span className="text-neutral-500 mt-0.5 block">Automatically hand off to a human agent below the confidence threshold.</span>
              </div>
              <input
                type="checkbox"
                checked={autoEscalation}
                onChange={(e) => setAutoEscalation(e.target.checked)}
                className="h-4.5 w-4.5 rounded text-danger"
                aria-label="Auto-Escalation"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center font-semibold text-neutral-600">
                <label htmlFor="ai-escalation-input">Escalation Confidence Threshold</label>
                <span className="text-danger font-bold">{escalationPct}%</span>
              </div>
              <input
                id="ai-escalation-input"
                type="range"
                min="10"
                max="80"
                value={escalationPct}
                onChange={(e) => setEscalationPct(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-danger"
              />
            </div>

            <button
              onClick={() => updateMutation.mutate({ escalationThreshold: escalationPct / 100, autoEscalationEnabled: autoEscalation })}
              disabled={updateMutation.isPending}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        )}

        {/* 4. COSTS TAB */}
        {activeTab === 'costs' && (
          <div className="max-w-xl space-y-6 text-xs text-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
              <Coins className="h-4 w-4 text-primary-500" />
              <span>Token Budget & Safety Limits</span>
            </h2>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ai-cost-limit" className="font-semibold text-neutral-600">Monthly Spending Safety Cap ($)</label>
              <input
                id="ai-cost-limit"
                type="number"
                value={costLimitMonthly}
                onChange={(e) => setCostLimitMonthly(Number(e.target.value))}
                className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Spend (Last 30 Days)</span>
                <span className="text-lg font-extrabold text-neutral-800 block mt-1">${aiMetrics ? aiMetrics.estimatedCost.toFixed(2) : '0.00'}</span>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Tokens Used</span>
                <span className="text-lg font-extrabold text-neutral-800 block mt-1">{aiMetrics ? aiMetrics.tokensUsed.toLocaleString() : '0'}</span>
              </div>
            </div>

            <button
              onClick={() => updateMutation.mutate({ costLimitMonthly })}
              disabled={updateMutation.isPending}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Update Budget Caps'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
