import React, { useState, useEffect, useRef } from 'react';
import { Send, Eye, ShieldAlert, Paperclip, Sparkles } from 'lucide-react';
import { useInboxStore } from '../store/inboxStore';
import { useSendMessage } from '../hooks/useQueries';
import { useRealtime } from '../hooks/useRealtime';

export function MessageComposer() {
  const activeConversationId = useInboxStore((state) => state.activeConversationId);
  const [content, setContent] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string; size: number; type: string }[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendMessageMutation = useSendMessage();
  const { emitTyping } = useRealtime('agent-101');

  useEffect(() => {
    // Reset composer state on conversation switch
    setContent('');
    setIsInternalNote(false);
    setAttachments([]);
  }, [activeConversationId]);

  if (!activeConversationId) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    // Emit typing status to customer/collaborators
    emitTyping(activeConversationId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(activeConversationId, false);
    }, 1500);
  };

  const handleSend = () => {
    if (!content.trim() && attachments.length === 0) return;

    sendMessageMutation.mutate(
      {
        conversationId: activeConversationId,
        content: content.trim(),
        isInternalNote,
      },
      {
        onSuccess: () => {
          setContent('');
          setAttachments([]);
          emitTyping(activeConversationId, false);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addMockAttachment = () => {
    setAttachments((prev) => [
      ...prev,
      {
        name: 'invoice-doc.pdf',
        url: '#',
        size: 154200,
        type: 'application/pdf',
      },
    ]);
  };

  return (
    <div className="p-4 border-t border-neutral-200 bg-white space-y-3">
      {/* Mode Selectors */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsInternalNote(false)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
            !isInternalNote
              ? 'bg-primary-50 border-primary-200 text-primary-700 font-bold'
              : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
          }`}
          aria-label="Public reply mode"
        >
          💬 Public Reply
        </button>
        <button
          onClick={() => setIsInternalNote(true)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
            isInternalNote
              ? 'bg-amber-50 border-amber-200 text-amber-700 font-bold'
              : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
          }`}
          aria-label="Internal note mode"
        >
          🔒 Internal Note
        </button>
      </div>

      {/* Editor Main Text Area */}
      <div
        className={`rounded-md border p-1 transition-all ${
          isInternalNote
            ? 'border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/50 bg-amber-50/10'
            : 'border-neutral-200 focus-within:ring-2 focus-within:ring-primary-500/50 bg-white'
        }`}
      >
        <textarea
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isInternalNote
              ? 'Type an internal note visible only to support agents...'
              : 'Type public reply to customer (Shift+Enter for new line)...'
          }
          className="w-full text-sm text-neutral-800 p-2 border-none outline-none resize-none min-h-[90px] bg-transparent placeholder:text-neutral-400"
          aria-label="Message text composer"
        />

        {/* Selected Attachments list */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-neutral-50 border-t border-neutral-100 rounded-b">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 px-2.5 py-1 rounded">
                <span>📎 {file.name}</span>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-neutral-400 hover:text-danger ml-1 font-bold text-xs"
                  aria-label={`Remove attachment ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions and Send Triggers */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={addMockAttachment}
            className="p-2 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition"
            title="Attach a file"
            aria-label="Attach a file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setContent((prev) => prev + '/macro ')}
            className="px-2.5 py-1.5 rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 text-xs font-semibold transition"
            title="Insert a macro shortcut"
            aria-label="Insert macro shortcut"
          >
            ⌨️ Macros (/)
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={sendMessageMutation.isPending || (!content.trim() && attachments.length === 0)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md shadow-xs transition ${
            isInternalNote
              ? 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500'
              : 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500'
          } disabled:opacity-50 disabled:pointer-events-none`}
          aria-label="Send message"
        >
          {sendMessageMutation.isPending ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>{isInternalNote ? 'Save Note' : 'Send'}</span>
        </button>
      </div>
    </div>
  );
}
