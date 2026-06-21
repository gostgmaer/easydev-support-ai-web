import * as React from 'react';
import { useReactTable, getCoreRowModel, flexRender, type RowSelectionState } from '@tanstack/react-table';
import { TableHeaderGroups, TableSelectionCell, tableCellClassName } from './table-shared';
import { Pagination } from '../base/Pagination';
import { Spinner } from '../base/Spinner';
import type { DataTableColumn } from '../../types/table';
import type { SortState } from '../../types/common';
import { cn } from '../../utils';

export interface ServerSideTableProps<TData> {
  data: TData[];
  columns: Array<DataTableColumn<TData>>;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
  sort?: SortState;
  onSortChange?: (sort: SortState | undefined) => void;
  isLoading?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onRowClick?: (row: TData) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

export function ServerSideTable<TData>({
  data,
  columns,
  totalCount,
  pageIndex,
  pageSize,
  onPageChange,
  sort,
  onSortChange,
  isLoading = false,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  onRowClick,
  emptyState,
  className,
}: ServerSideTableProps<TData>) {
  const [internalSelection, setInternalSelection] = React.useState<RowSelectionState>({});
  const selection = rowSelection ?? internalSelection;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: {
      rowSelection: selection,
      pagination: { pageIndex, pageSize },
      sorting: sort ? [{ id: sort.columnId, desc: sort.direction === 'desc' }] : [],
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(selection) : updater;
      setInternalSelection(next);
      onRowSelectionChange?.(next);
    },
    onSortingChange: (updater) => {
      const current = sort ? [{ id: sort.columnId, desc: sort.direction === 'desc' }] : [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      const nextSort = next[0];
      onSortChange?.(nextSort ? { columnId: nextSort.id, direction: nextSort.desc ? 'desc' : 'asc' } : undefined);
    },
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!isLoading && data.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="relative overflow-x-auto rounded-md border border-border">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <Spinner size="lg" />
          </div>
        )}
        <table className="w-full border-collapse">
          <TableHeaderGroups table={table} selectable={enableRowSelection} />
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn('transition-colors hover:bg-muted/40', onRowClick && 'cursor-pointer')}
              >
                {enableRowSelection && <TableSelectionCell row={row} />}
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={tableCellClassName((cell.column.columnDef as DataTableColumn<TData>).align)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && <Pagination pageIndex={pageIndex} pageCount={pageCount} onPageChange={onPageChange} />}
    </div>
  );
}
