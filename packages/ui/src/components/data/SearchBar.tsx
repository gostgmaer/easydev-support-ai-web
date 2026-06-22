import * as React from 'react';
import { SearchInput, type SearchInputProps } from '../base/SearchInput';
import { cn } from '../../utils';

export interface SearchBarProps extends SearchInputProps {
  actions?: React.ReactNode;
  containerClassName?: string;
}

export function SearchBar({ actions, containerClassName, className, ...props }: SearchBarProps) {
  return (
    <div className={cn('flex items-center gap-2', containerClassName)}>
      <SearchInput className={cn('max-w-sm', className)} {...props} />
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
