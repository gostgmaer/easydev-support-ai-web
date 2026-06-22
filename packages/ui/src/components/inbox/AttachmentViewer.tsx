import * as React from 'react';
import { FileText, Download, AlertCircle } from 'lucide-react';
import type { AttachmentMeta } from '../../types/inbox';
import { formatFileSize } from '../../utils';
import { cn } from '../../utils';

export interface AttachmentViewerProps {
  attachment: AttachmentMeta;
  className?: string;
}

const IMAGE_MIME_PREFIX = 'image/';

export function AttachmentViewer({ attachment, className }: AttachmentViewerProps) {
  const isImage = attachment.mimeType.startsWith(IMAGE_MIME_PREFIX);

  if (isImage) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('block w-40 overflow-hidden rounded-md border border-border', className)}
      >
        <img src={attachment.thumbnailUrl ?? attachment.url} alt={attachment.name} className="h-28 w-full object-cover" />
        <span className="block truncate px-2 py-1 text-xs text-muted-foreground">{attachment.name}</span>
      </a>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex w-64 items-center gap-3 rounded-md border border-border bg-background px-3 py-2 hover:bg-muted',
        className,
      )}
    >
      <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
      <span className="flex-1 overflow-hidden">
        <span className="block truncate text-sm font-medium text-foreground">{attachment.name}</span>
        <span className="block text-xs text-muted-foreground">{formatFileSize(attachment.sizeBytes)}</span>
      </span>
      {attachment.uploadError ? (
        <AlertCircle className="h-4 w-4 shrink-0 text-danger" aria-label="Upload failed" />
      ) : (
        <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
    </a>
  );
}
