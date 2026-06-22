import * as React from 'react';
import { DataTable, type DataTableProps } from '../data/DataTable';
import { ExportMenu } from '../data/ExportMenu';
import type { ExportOption } from '../../types/table';
import { cn } from '../../utils';

export interface ReportTableProps<TData> extends DataTableProps<TData> {
  title?: React.ReactNode;
  exportOptions?: ExportOption[];
}

export function ReportTable<TData>({ title, exportOptions, className, ...tableProps }: ReportTableProps<TData>) {
  return (
    <div className={cn('space-y-3', className)}>
      {(title || exportOptions) && (
        <div className="flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
          {exportOptions && <ExportMenu options={exportOptions} />}
        </div>
      )}
      <DataTable {...tableProps} />
    </div>
  );
}
