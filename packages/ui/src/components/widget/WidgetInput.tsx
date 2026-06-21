import * as React from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Textarea } from '../base/Textarea';
import { IconButton } from '../base/IconButton';
import { cn } from '../../utils';

export interface WidgetInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  isSending?: boolean;
  placeholder?: string;
  className?: string;
}

export function WidgetInput({ value, onValueChange, onSend, onAttach, isSending = false, placeholder = 'Write a message…', className }: WidgetInputProps) {
  const handleSend = () => {
    if (!value.trim() || isSending) return;
    onSend();
  };

  return (
    <div className={cn('flex items-end gap-2 border-t border-border p-3', className)}>
      {onAttach && <IconButton icon={<Paperclip className="h-4 w-4" />} label="Attach file" size="sm" variant="ghost" onClick={onAttach} />}
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
        className="max-h-24 min-h-9 resize-none py-2"
      />
      <IconButton icon={<Send className="h-4 w-4" />} label="Send" size="sm" disabled={!value.trim() || isSending} onClick={handleSend} />
    </div>
  );
}
