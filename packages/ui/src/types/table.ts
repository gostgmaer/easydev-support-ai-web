import type * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

export type DataTableColumn<TData> = ColumnDef<TData, unknown> & {
  /** Unique key used by ColumnManager / SavedViews to persist visibility & order. */
  id: string;
  align?: 'left' | 'center' | 'right';
  pinned?: 'left' | 'right' | false;
  exportable?: boolean;
};

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'not_contains'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty';

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value?: unknown;
}

export type FilterCombinator = 'and' | 'or';

export interface FilterGroup {
  combinator: FilterCombinator;
  conditions: FilterCondition[];
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterGroup;
  sort?: { columnId: string; direction: 'asc' | 'desc' };
  columnVisibility?: Record<string, boolean>;
  isDefault?: boolean;
  isShared?: boolean;
}

export interface BulkAction<TData> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  tone?: 'neutral' | 'danger';
  isDisabled?: (selected: TData[]) => boolean;
  onAction: (selected: TData[]) => void | Promise<void>;
}

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';

export interface ExportOption {
  format: ExportFormat;
  label: string;
  onExport: () => void | Promise<void>;
}
