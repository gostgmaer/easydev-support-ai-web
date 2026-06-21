'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Cpu, AlertCircle, Coins, Sliders, ShieldCheck, Sparkles } from 'lucide-react';

export default function AiPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = React.useState<'agents' | 'workflows' | 'escalations' | 'costs'>('agents');
  
  // Local Form state
  const [model, setModel] = React.useState('gemini-2.0-flash');
  const [confidence, setConfidence] = React.useState(85);
  const [costLimit, setCostLimit] = React.useState(150.0);

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

  const handleSaveConfig = () => {
    alert('AI configurations saved successfully.');
  };

  return (
    <div className="space-y-6" role="region" aria-label="AI Platform Configurator">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-neutral-900">AI Platform Configuration</h1>
          <p className="text-xs text-neutral-500">Tune LLM model versions, define confidence handoff bounds, and monitor token spending.</p>
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
        {/* 1. AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="max-w-xl space-y-6 text-xs text-neutral-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-2">
              <Cpu className="h-4 w-4 text-primary-500" />
              <span>Model & Core Tuning</span>
            </h2>

            {/* Model Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ai-model-select" className="font-semibold text-neutral-600">Primary Core LLM Model</label>
              <select
                id="ai-model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (High Reasoning)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </div>

            {/* Confidence slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center font-semibold text-neutral-600">
                <label htmlFor="ai-confidence-input">Auto-Response Confidence Threshold</label>
                <span className="text-primary-600 font-bold">{confidence}%</span>
              </div>
              <input
                id="ai-confidence-input"
                type="range"
                min="50"
                max="98"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <span className="text-[10px] text-neutral-400 block leading-normal">
                Suggested responses with confidence matching below this limit are held as agent drafts.
              </span>
            </div>

            <button
              onClick={handleSaveConfig}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition"
            >
              Save Model Configuration
            </button>
          </div>
        )}

        {/* 2. WORKFLOWS TAB */}
        {activeTab === 'workflows' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">AI Assist Workflows</h2>
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-neutral-800 block">Prefetch Suggestions</span>
                <span className="text-neutral-500 mt-0.5 block">AI drafts will prefetch automatically on incoming tickets.</span>
              </div>
              <input type="checkbox" defaultChecked className="h-4.5 w-4.5 rounded text-primary-500" aria-label="Prefetch Suggestions" />
            </div>
          </div>
        )}

        {/* 3. ESCALATION TAB */}
        {activeTab === 'escalations' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Escalation Handoff Criteria</h2>
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50/50 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-neutral-800 block">SLA Warning Autopromotion</span>
                <span className="text-neutral-500 mt-0.5 block">Instantly escalate and claim tickets breaching SLA targets.</span>
              </div>
              <input type="checkbox" defaultChecked className="h-4.5 w-4.5 rounded text-danger" aria-label="SLA Warning Autopromotion" />
            </div>
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
                value={costLimit}
                onChange={(e) => setCostLimit(Number(e.target.value))}
                className="border border-neutral-200 rounded p-2.5 bg-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Spend This Month</span>
                <span className="text-lg font-extrabold text-neutral-800 block mt-1">$42.34</span>
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Token Consumptions</span>
                <span className="text-lg font-extrabold text-neutral-800 block mt-1">14.2M tokens</span>
              </div>
            </div>

            <button
              onClick={handleSaveConfig}
              className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold py-2 px-4 rounded transition"
            >
              Update Budget Caps
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
