import * as React from 'react';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import type { AttachmentMeta } from '../../types/inbox';
import { formatFileSize } from '../../utils';
import { Progress } from '../base/Progress';
import { IconButton } from '../base/IconButton';
import { cn } from '../../utils';

export interface AttachmentUploaderProps {
  pendingAttachments: AttachmentMeta[];
  onFilesSelected: (files: File[]) => void;
  onRemove: (id: string) => void;
  accept?: string;
  maxSizeBytes?: number;
  className?: string;
}

export function AttachmentUploader({
  pendingAttachments,
  onFilesSelected,
  onRemove,
  accept,
  maxSizeBytes,
  className,
}: AttachmentUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).filter((file) => !maxSizeBytes || file.size <= maxSizeBytes);
    if (files.length > 0) onFilesSelected(files);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => event.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border px-4 py-6 text-center transition-colors',
          isDragging && 'border-primary bg-primary/5',
        )}
      >
        <UploadCloud className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-foreground">Drag files here or click to browse</p>
        {maxSizeBytes && <p className="text-xs text-muted-foreground">Max size {formatFileSize(maxSizeBytes)}</p>}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>
      {pendingAttachments.length > 0 && (
        <ul className="space-y-1.5">
          {pendingAttachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
              <span className="flex-1 truncate text-sm text-foreground">{attachment.name}</span>
              {attachment.uploadError ? (
                <span className="flex items-center gap-1 text-xs text-danger">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {attachment.uploadError}
                </span>
              ) : attachment.uploadProgress !== undefined && attachment.uploadProgress < 100 ? (
                <Progress value={attachment.uploadProgress} className="w-20" />
              ) : (
                <span className="text-xs text-muted-foreground">{formatFileSize(attachment.sizeBytes)}</span>
              )}
              <IconButton icon={<X className="h-3.5 w-3.5" />} label="Remove attachment" size="xs" variant="ghost" onClick={() => onRemove(attachment.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
