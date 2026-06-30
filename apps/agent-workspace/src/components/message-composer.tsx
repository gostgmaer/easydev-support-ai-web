import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@easydev/auth';
import { MessageComposer as MessageComposerPrimitive } from '@easydev/ui';
import { useConversationStore } from '../store/conversationStore';
import { useInboxStore } from '../store/inboxStore';
import { useSendMessage, useMessageTemplates, useMyConversationDraft, useSaveDraft, useAiSuggestResponse } from '../hooks/useQueries';
import { useRealtime } from '../hooks/useRealtime';

const DRAFT_SAVE_DEBOUNCE_MS = 800;

export function MessageComposer() {
  const { user } = useAuth();
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const draft = useConversationStore((state) =>
    activeConversationId ? state.drafts[activeConversationId] ?? '' : '',
  );
  const setDraft = useConversationStore((state) => state.setDraft);

  const [value, setValue] = useState(draft);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const draftSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessageMutation = useSendMessage();
  const { data: templates = [] } = useMessageTemplates();
  const { emitTyping } = useRealtime(user?.id);
  const { data: serverDraft } = useMyConversationDraft(activeConversationId);
  const saveDraftMutation = useSaveDraft();
  const aiSuggestMutation = useAiSuggestResponse();

  // Restore draft: prefer local Zustand draft (typing in progress), fall back to server-persisted draft.
  useEffect(() => {
    if (draft) {
      setValue(draft);
    } else if (serverDraft?.content) {
      setValue(serverDraft.content);
      setDraft(activeConversationId!, serverDraft.content);
    } else {
      setValue('');
    }
  }, [activeConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeConversationId) return null;

  const handleValueChange = (next: string) => {
    setValue(next);
    setSuggestError(null);
    emitTyping(activeConversationId, next.length > 0);

    if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);
    draftSaveTimeoutRef.current = setTimeout(() => {
      setDraft(activeConversationId, next);
      if (next.trim()) {
        saveDraftMutation.mutate({ conversationId: activeConversationId, content: next, isInternalNote: false });
      }
    }, DRAFT_SAVE_DEBOUNCE_MS);
  };

  const handleSend = (content: string, isInternalNote: boolean) => {
    sendMessageMutation.mutate(
      { conversationId: activeConversationId, content, isInternalNote },
      {
        onSuccess: () => {
          setValue('');
          setDraft(activeConversationId, '');
          emitTyping(activeConversationId, false);
        },
      },
    );
  };

  const handleInsertTemplate = (content: string) => {
    handleValueChange(value ? `${value}\n${content}` : content);
    setTemplatesOpen(false);
  };

  const handleAiSuggest = () => {
    setSuggestError(null);
    aiSuggestMutation.mutate(
      { conversationId: activeConversationId },
      {
        onSuccess: (result) => {
          if (result.suggestion) {
            handleValueChange(result.suggestion);
          }
        },
        onError: () => setSuggestError('AI suggestion failed. Please try again.'),
      },
    );
  };

  return (
    <div className="relative">
      {/* AI Suggest toolbar */}
      <div className="flex items-center justify-between px-3 pt-2 pb-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={aiSuggestMutation.isPending}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary-600 border border-primary-200 rounded-full px-2.5 py-1 hover:bg-primary-50 disabled:opacity-50 transition"
            title="Ask AI to suggest a reply based on the conversation"
          >
            <Sparkles className={`h-3 w-3 ${aiSuggestMutation.isPending ? 'animate-pulse' : ''}`} />
            {aiSuggestMutation.isPending ? 'Generating…' : 'AI Suggest'}
          </button>
          {suggestError && (
            <span className="flex items-center gap-1 text-[10px] text-danger">
              <AlertCircle className="h-3 w-3" />
              {suggestError}
            </span>
          )}
        </div>
      </div>

      {templatesOpen && (
        <div className="absolute bottom-full left-3 z-10 mb-1 max-h-56 w-72 overflow-y-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
          {templates.length === 0 ? (
            <p className="px-3 py-2 text-xs text-neutral-400">No templates available</p>
          ) : (
            templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleInsertTemplate(template.content)}
                className="block w-full truncate px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100"
              >
                {template.title}
              </button>
            ))
          )}
        </div>
      )}

      <MessageComposerPrimitive
        value={value}
        onValueChange={handleValueChange}
        onSend={handleSend}
        onOpenTemplates={() => setTemplatesOpen((prev) => !prev)}
        isSending={sendMessageMutation.isPending}
        placeholder="Type a public reply or switch to an internal note…"
      />
    </div>
  );
}
