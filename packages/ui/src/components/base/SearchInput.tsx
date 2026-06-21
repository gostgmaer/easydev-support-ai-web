import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input, type InputProps } from './Input';
import { IconButton } from './IconButton';
import { cn } from '../../utils';

export interface SearchInputProps extends Omit<InputProps, 'startSlot' | 'endSlot' | 'type'> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onClear, className, ...props }, ref) => {
    const hasValue = typeof value === 'string' ? value.length > 0 : Boolean(value);
    return (
      <Input
        ref={ref}
        type="search"
        value={value}
        className={cn('[&::-webkit-search-cancel-button]:appearance-none', className)}
        startSlot={<Search className="h-4 w-4" aria-hidden="true" />}
        endSlot={
          hasValue && onClear ? (
            <IconButton
              icon={<X className="h-3.5 w-3.5" />}
              label="Clear search"
              size="xs"
              variant="ghost"
              onClick={onClear}
            />
          ) : undefined
        }
        {...props}
      />
    );
  },
);
SearchInput.displayName = 'SearchInput';
