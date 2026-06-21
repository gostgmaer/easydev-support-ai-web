import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { TableHeaderGroups, TableSelectionCell, tableCellClassName } from './table-shared';
import { Pagination } from '../base/Pagination';
import type { DataTableColumn } from '../../types/table';
import { cn } from '../../utils';

export interface DataTableProps<TData> {
  data: TData[];
  columns: Array<DataTableColumn<TData>>;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onRowClick?: (row: TData) => void;
  pageSize?: number;
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<TData>({
  data,
  columns,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  onRowClick,
  pageSize = 20,
  emptyState,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [internalSelection, setInternalSelection] = React.useState<RowSelectionState>({});
  const selection = rowSelection ?? internalSelection;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection: selection },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(selection) : updater;
      setInternalSelection(next);
      onRowSelectionChange?.(next);
    },
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize } },
  });

  if (data.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="overflow-x-auto rounded-md border border-border">
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
      {table.getPageCount() > 1 && (
        <Pagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={table.getPageCount()}
          onPageChange={(index) => table.setPageIndex(index)}
        />
      )}
    </div>
  );
}
