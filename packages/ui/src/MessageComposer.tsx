import * as React from "react";
import { Send, Paperclip, BookOpen } from "lucide-react";
import { Button } from "./Button";

interface MessageComposerProps {
  onSend: (content: string, isInternalNote: boolean) => void;
  onAttachFile?: () => void;
  onOpenTemplates?: () => void;
  placeholder?: string;
}

export function MessageComposer({
  onSend,
  onAttachFile,
  onOpenTemplates,
  placeholder = "Type a message...",
}: MessageComposerProps) {
  const [content, setContent] = React.useState("");
  const [isInternalNote, setIsInternalNote] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSend(content, isInternalNote);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-neutral-200 rounded-lg bg-white overflow-hidden shadow-sm">
      {/* Modes Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50/50 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setIsInternalNote(false)}
          className={`rounded px-2.5 py-1 text-xs font-semibold ${
            !isInternalNote
              ? "bg-white text-neutral-900 shadow-sm border border-neutral-200"
              : "text-neutral-500 hover:text-neutral-900"
          }`}>
          Reply to Customer
        </button>
        <button
          type="button"
          onClick={() => setIsInternalNote(true)}
          className={`rounded px-2.5 py-1 text-xs font-semibold ${
            isInternalNote
              ? "bg-warning/15 text-warning border border-warning/20 shadow-sm"
              : "text-neutral-500 hover:text-neutral-900"
          }`}>
          Internal Note
        </button>
      </div>

      {/* Editor Box */}
      <div className="flex flex-col p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isInternalNote ? "Write internal note (only visible to team)..." : placeholder}
          className="w-full resize-none bg-transparent text-sm placeholder:text-neutral-400 focus:outline-none min-h-[60px] text-neutral-900"
          rows={3}
        />

        {/* Toolbar Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            {onAttachFile && (
              <button
                type="button"
                onClick={onAttachFile}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                title="Attach Files">
                <Paperclip className="h-4 w-4" />
              </button>
            )}
            {onOpenTemplates && (
              <button
                type="button"
                onClick={onOpenTemplates}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                title="Canned Templates">
                <BookOpen className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            type="submit"
            size="sm"
            variant={isInternalNote ? "secondary" : "default"}
            disabled={!content.trim()}
            className="flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5" />
            <span>{isInternalNote ? "Add Note" : "Send"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
