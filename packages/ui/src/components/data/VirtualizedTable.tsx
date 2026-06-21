import * as React from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TableHeaderGroups, tableCellClassName } from './table-shared';
import type { DataTableColumn } from '../../types/table';
import { cn } from '../../utils';

export interface VirtualizedTableProps<TData> {
  data: TData[];
  columns: Array<DataTableColumn<TData>>;
  rowHeight?: number;
  height?: number;
  onRowClick?: (row: TData) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

export function VirtualizedTable<TData>({
  data,
  columns,
  rowHeight = 44,
  height = 480,
  onRowClick,
  emptyState,
  className,
}: VirtualizedTableProps<TData>) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  if (data.length === 0 && emptyState) return <>{emptyState}</>;

  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]!.start : 0;
  const paddingBottom = virtualItems.length > 0 ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1]!.end : 0;

  return (
    <div ref={scrollRef} className={cn('overflow-auto rounded-md border border-border', className)} style={{ height }}>
      <table className="w-full border-collapse">
        <TableHeaderGroups table={table} />
        <tbody className="divide-y divide-border">
          {paddingTop > 0 && (
            <tr aria-hidden="true">
              <td style={{ height: paddingTop }} colSpan={columns.length} />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index]!;
            return (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn('transition-colors hover:bg-muted/40', onRowClick && 'cursor-pointer')}
                style={{ height: rowHeight }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={tableCellClassName((cell.column.columnDef as DataTableColumn<TData>).align)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr aria-hidden="true">
              <td style={{ height: paddingBottom }} colSpan={columns.length} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
