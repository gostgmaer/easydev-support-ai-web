import type { DocumentStatus } from '../../types/knowledge';

export const DOCUMENT_STATUS_TONE: Record<DocumentStatus, 'neutral' | 'success' | 'warning'> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'neutral',
};
