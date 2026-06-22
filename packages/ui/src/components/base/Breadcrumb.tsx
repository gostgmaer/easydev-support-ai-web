import * as React from 'react';
import NextLink from 'next/link';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  maxVisible?: number;
  className?: string;
}

export function Breadcrumb({ items, maxVisible, className }: BreadcrumbProps) {
  const visibleItems =
    maxVisible && items.length > maxVisible
      ? [items[0]!, { label: '…', href: undefined }, ...items.slice(items.length - (maxVisible - 1))]
      : items;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center gap-1.5">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const isEllipsis = item.label === '…';
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
              {isEllipsis ? (
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" aria-label="Collapsed items" />
              ) : item.href && !isLast ? (
                <NextLink href={item.href} className="text-muted-foreground hover:text-foreground hover:underline">
                  {item.label}
                </NextLink>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={cn(isLast ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
