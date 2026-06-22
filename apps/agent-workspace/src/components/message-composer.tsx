import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@easydev/auth';
import { MessageComposer as MessageComposerPrimitive } from '@easydev/ui';
import { useConversationStore } from '../store/conversationStore';
import { useInboxStore } from '../store/inboxStore';
import { useSendMessage, useMessageTemplates } from '../hooks/useQueries';
import { useRealtime } from '../hooks/useRealtime';

const DRAFT_SAVE_DEBOUNCE_MS = 400;

export function MessageComposer() {
  const { user } = useAuth();
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const draft = useConversationStore((state) =>
    activeConversationId ? state.drafts[activeConversationId] ?? '' : '',
  );
  const setDraft = useConversationStore((state) => state.setDraft);

  const [value, setValue] = useState(draft);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const draftSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessageMutation = useSendMessage();
  const { data: templates = [] } = useMessageTemplates();
  const { emitTyping } = useRealtime(user?.id);

  // Restore the in-progress draft when switching conversations (draft recovery).
  useEffect(() => {
    setValue(draft);
  }, [activeConversationId, draft]);

  if (!activeConversationId) return null;

  const handleValueChange = (next: string) => {
    setValue(next);
    emitTyping(activeConversationId, next.length > 0);

    if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);
    draftSaveTimeoutRef.current = setTimeout(() => {
      setDraft(activeConversationId, next);
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

  return (
    <div className="relative">
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
