import React from 'react';
import { Bot, Sparkles, AlertCircle, Play, Pause, RefreshCw, Check, Edit3, Trash2, Cpu } from 'lucide-react';
import { useConversationStore } from '../store/conversationStore';
import { useInboxStore } from '../store/inboxStore';
import { useUpdateAiStatus } from '../hooks/useQueries';
import { Badge } from '@easydev/ui/src/Badge';

export function AiPanel() {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const conversations = useInboxStore((state) => state.conversations);
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const aiDraft = useConversationStore((state) => {
    if (!activeConversationId) return null;
    return state.aiDrafts[activeConversationId] || null;
  });

  const setDraftText = useConversationStore((state) => state.setDraft);
  const setAiDraft = useConversationStore((state) => state.setAiDraft);
  const updateAiStatusMutation = useUpdateAiStatus();

  if (!activeConv) return null;

  const handleStatusChange = (status: 'active' | 'paused' | 'takeover') => {
    updateAiStatusMutation.mutate({ conversationId: activeConv.id, status });
  };

  const handleApplyDraft = () => {
    if (aiDraft) {
      setDraftText(activeConv.id, aiDraft.content);
    }
  };

  const handleRejectDraft = () => {
    setAiDraft(activeConv.id, null);
  };

  return (
    <div className="flex flex-col h-full bg-white divide-y divide-neutral-100 overflow-y-auto" aria-label="AI Assistant Panel">
      {/* AI Controls Header */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-primary-600 font-semibold text-sm">
            <Sparkles className="h-4.5 w-4.5 text-cyan-500 animate-pulse" />
            <span>AI Copilot Status</span>
          </div>
          <Badge variant={activeConv.aiStatus === 'active' ? 'success' : activeConv.aiStatus === 'paused' ? 'warning' : 'secondary'}>
            {activeConv.aiStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Action Toggle buttons */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {activeConv.aiStatus === 'active' ? (
            <button
              onClick={() => handleStatusChange('paused')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 font-semibold rounded transition"
              aria-label="Pause AI copilot agent"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause AI Agent</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-success/30 bg-success/10 text-success hover:bg-success/20 font-semibold rounded transition"
              aria-label="Resume AI copilot agent"
            >
              <Play className="h-3.5 w-3.5 animate-pulse" />
              <span>Resume AI Agent</span>
            </button>
          )}

          {activeConv.aiStatus !== 'takeover' ? (
            <button
              onClick={() => handleStatusChange('takeover')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 font-semibold rounded transition"
              aria-label="Take over conversation manually"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Manual Takeover</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-semibold rounded transition"
              aria-label="Return conversation to AI agent"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Hand Back to AI</span>
            </button>
          )}
        </div>
      </div>

      {/* Suggested Draft Content Area */}
      {aiDraft ? (
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Suggested Draft</span>
            <div className="flex gap-2">
              <span className="text-neutral-500 font-medium">${aiDraft.cost.toFixed(4)} cost</span>
              <span className={`font-bold ${aiDraft.confidence >= 0.85 ? 'text-success' : 'text-warning'}`}>
                {Math.round(aiDraft.confidence * 100)}% confidence
              </span>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 border border-blue-200 rounded text-xs text-neutral-800 leading-relaxed font-medium">
            {aiDraft.content}
          </div>

          {/* Draft Actions */}
          <div className="flex gap-2 text-xs">
            <button
              onClick={handleApplyDraft}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded shadow-xs transition"
              aria-label="Apply suggested AI draft"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply Draft</span>
            </button>
            <button
              onClick={handleRejectDraft}
              className="p-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-500 hover:text-danger rounded transition"
              title="Reject draft suggestion"
              aria-label="Reject draft suggestion"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 text-center text-neutral-400 text-xs">
          <Bot className="h-8 w-8 text-neutral-300 mx-auto mb-2 animate-bounce" />
          <p>No draft suggestion available yet.</p>
        </div>
      )}

      {/* Tool Call Logs Viewer */}
      {aiDraft && aiDraft.toolCalls && aiDraft.toolCalls.length > 0 && (
        <div className="p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Cpu className="h-4 w-4" />
            <span>LLM Tool Executions</span>
          </h3>

          <div className="space-y-2">
            {aiDraft.toolCalls.map((tool, idx) => (
              <div key={idx} className="p-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-neutral-800">{tool.name}</span>
                  <span className={`text-[9px] uppercase font-black px-1 py-0.25 rounded ${
                    tool.status === 'success' ? 'text-success bg-success/15' : tool.status === 'failed' ? 'text-danger bg-danger/15 animate-pulse' : 'text-neutral-500 bg-neutral-100'
                  }`}>
                    {tool.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold block">ARGUMENTS:</span>
                  <pre className="text-[10px] bg-white p-1.5 border border-neutral-100 rounded overflow-x-auto text-neutral-700 max-h-[80px]">
                    {JSON.stringify(tool.arguments, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
