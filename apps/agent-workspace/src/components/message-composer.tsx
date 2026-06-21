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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleAttachFile = () => fileInputRef.current?.click();

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    // No durable file-storage endpoint is exposed by the backend yet (see lib/normalize.ts
    // sibling note in useQueries.ts) - attachments are appended as local references the
    // agent can review before sending; wiring a real upload finishes once that endpoint exists.
    const names = Array.from(files).map((file) => file.name).join(', ');
    handleValueChange(`${value}${value ? '\n' : ''}[Attached: ${names}]`);
    event.target.value = '';
  };

  const handleInsertTemplate = (content: string) => {
    handleValueChange(value ? `${value}\n${content}` : content);
    setTemplatesOpen(false);
  };

  return (
    <div className="relative">
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesSelected} />

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
        onAttachFile={handleAttachFile}
        onOpenTemplates={() => setTemplatesOpen((prev) => !prev)}
        isSending={sendMessageMutation.isPending}
        placeholder="Type a public reply or switch to an internal note…"
      />
    </div>
  );
}
