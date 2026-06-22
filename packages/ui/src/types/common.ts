import type * as React from 'react';

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentTone = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';

export interface AsChildProps {
  asChild?: boolean;
}

export interface PolymorphicProps<T extends React.ElementType = 'div'> {
  as?: T;
}

export interface OptionItem<TValue = string> {
  value: TValue;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface GroupedOptions<TValue = string> {
  label: string;
  options: Array<OptionItem<TValue>>;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
}

export interface CursorPaginationState {
  cursor: string | null;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: LoadState;
  data?: T;
  error?: string;
}
