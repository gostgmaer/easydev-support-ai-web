import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { focusRingClassName } from '@easydev/design-system';
import { cn } from '../../utils';

export interface PaginationProps {
  pageIndex: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
  siblingCount?: number;
  className?: string;
}

function buildPageList(pageIndex: number, pageCount: number, siblingCount: number): Array<number | 'ellipsis'> {
  const totalVisible = siblingCount * 2 + 5;
  if (pageCount <= totalVisible) return Array.from({ length: pageCount }, (_, i) => i);

  const left = Math.max(pageIndex - siblingCount, 1);
  const right = Math.min(pageIndex + siblingCount, pageCount - 2);

  const pages: Array<number | 'ellipsis'> = [0];
  if (left > 1) pages.push('ellipsis');
  for (let page = left; page <= right; page += 1) pages.push(page);
  if (right < pageCount - 2) pages.push('ellipsis');
  pages.push(pageCount - 1);
  return pages;
}

export function Pagination({ pageIndex, pageCount, onPageChange, siblingCount = 1, className }: PaginationProps) {
  const pages = buildPageList(pageIndex, pageCount, siblingCount);

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={pageIndex === 0}
        onClick={() => onPageChange(pageIndex - 1)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50',
          focusRingClassName,
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-current={page === pageIndex ? 'page' : undefined}
            onClick={() => onPageChange(page)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-sm',
              page === pageIndex ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
              focusRingClassName,
            )}
          >
            {page + 1}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={pageIndex === pageCount - 1}
        onClick={() => onPageChange(pageIndex + 1)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50',
          focusRingClassName,
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
