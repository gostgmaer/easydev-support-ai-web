import * as React from 'react';
import { X } from 'lucide-react';
import type { AttachmentMeta } from '../../types/inbox';
import { formatFileSize } from '../../utils';
import { cn } from '../../utils';

export interface WidgetAttachmentUploaderProps {
  pendingAttachments: AttachmentMeta[];
  onRemove: (id: string) => void;
  className?: string;
}

export function WidgetAttachmentUploader({ pendingAttachments, onRemove, className }: WidgetAttachmentUploaderProps) {
  if (pendingAttachments.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5 border-t border-border px-3 pt-2', className)}>
      {pendingAttachments.map((attachment) => (
        <span key={attachment.id} className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs text-foreground">
          <span className="max-w-[8rem] truncate">{attachment.name}</span>
          <span className="text-muted-foreground">{formatFileSize(attachment.sizeBytes)}</span>
          <button type="button" aria-label={`Remove ${attachment.name}`} onClick={() => onRemove(attachment.id)} className="text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
