import * as React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from '../base/Checkbox';
import { cn } from '../../utils';

export function TableHeaderGroups<TData>({ table, selectable = false }: { table: Table<TData>; selectable?: boolean }) {
  return (
    <thead className="border-b border-border bg-muted/50">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {selectable && <TableSelectionHeaderCell table={table} />}
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort();
            const sortDirection = header.column.getIsSorted();
            return (
              <th
                key={header.id}
                colSpan={header.colSpan}
                style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                className="h-10 whitespace-nowrap px-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {header.isPlaceholder ? null : canSort ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {sortDirection === 'asc' && <ArrowUp className="h-3 w-3" />}
                    {sortDirection === 'desc' && <ArrowDown className="h-3 w-3" />}
                    {!sortDirection && <ChevronsUpDown className="h-3 w-3 opacity-40" />}
                  </button>
                ) : (
                  flexRender(header.column.columnDef.header, header.getContext())
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}

export function TableSelectionHeaderCell<TData>({ table }: { table: Table<TData> }) {
  return (
    <th className="h-10 w-10 px-3">
      <Checkbox
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
        aria-label="Select all rows"
      />
    </th>
  );
}

export function TableSelectionCell<TData>({ row }: { row: { getIsSelected: () => boolean; toggleSelected: (value: boolean) => void } }) {
  return (
    <td className="w-10 px-3">
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(checked) => row.toggleSelected(checked === true)} aria-label="Select row" />
    </td>
  );
}

export const tableCellClassName = (align?: 'left' | 'center' | 'right') =>
  cn('px-3 py-2.5 text-sm text-foreground', align === 'center' && 'text-center', align === 'right' && 'text-right');
