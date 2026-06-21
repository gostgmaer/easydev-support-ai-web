export type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface KnowledgeArticleSummary {
  id: string;
  title: string;
  excerpt?: string;
  status: DocumentStatus;
  categoryName?: string;
  updatedAt: string;
}

export interface DocumentVersionEntry {
  id: string;
  versionLabel: string;
  editedBy: string;
  editedAt: string;
  changeSummary?: string;
  isCurrent: boolean;
}

export type PermissionLevel = 'view' | 'comment' | 'edit' | 'manage';

export interface PermissionGrant {
  id: string;
  principalName: string;
  principalType: 'user' | 'team' | 'role';
  level: PermissionLevel;
}
