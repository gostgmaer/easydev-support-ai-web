import * as React from 'react';
import { Send, Paperclip, BookOpen, Lock } from 'lucide-react';
import { Textarea } from '../base/Textarea';
import { Button } from '../base/Button';
import { IconButton } from '../base/IconButton';
import { cn } from '../../utils';

export interface MessageComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  onSend: (content: string, isInternalNote: boolean) => void;
  onAttachFile?: () => void;
  onOpenTemplates?: () => void;
  isSending?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageComposer({
  value,
  onValueChange,
  onSend,
  onAttachFile,
  onOpenTemplates,
  isSending = false,
  placeholder = 'Type a message…',
  className,
}: MessageComposerProps) {
  const [isInternalNote, setIsInternalNote] = React.useState(false);

  const handleSend = () => {
    if (!value.trim() || isSending) return;
    onSend(value.trim(), isInternalNote);
  };

  return (
    <div className={cn('flex flex-col gap-2 border-t border-border p-3', className)}>
      <Textarea
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
          }
        }}
        placeholder={placeholder}
        autoGrow
        className={cn('max-h-40', isInternalNote && 'border-warning/40 bg-warning/5')}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {onAttachFile && <IconButton icon={<Paperclip className="h-4 w-4" />} label="Attach file" size="sm" variant="ghost" onClick={onAttachFile} />}
          {onOpenTemplates && <IconButton icon={<BookOpen className="h-4 w-4" />} label="Insert template" size="sm" variant="ghost" onClick={onOpenTemplates} />}
          <IconButton
            icon={<Lock className="h-4 w-4" />}
            label={isInternalNote ? 'Switch to public reply' : 'Switch to internal note'}
            size="sm"
            variant={isInternalNote ? 'secondary' : 'ghost'}
            onClick={() => setIsInternalNote((prev) => !prev)}
          />
        </div>
        <Button type="button" size="sm" isLoading={isSending} disabled={!value.trim()} onClick={handleSend} trailingIcon={<Send className="h-4 w-4" />}>
          {isInternalNote ? 'Add note' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
