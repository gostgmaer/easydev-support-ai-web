import * as React from 'react';
import { ConnectorCard } from './ConnectorCard';
import { SearchInput } from '../base/SearchInput';
import { Select } from '../base/Select';
import type { ConnectorSummary } from '../../types/connector';
import { cn } from '../../utils';

export interface ConnectorMarketplaceProps {
  connectors: ConnectorSummary[];
  categories: string[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onInstall: (connector: ConnectorSummary) => void;
  onConfigure: (connector: ConnectorSummary) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

export function ConnectorMarketplace({
  connectors,
  categories,
  searchValue,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onInstall,
  onConfigure,
  emptyState,
  className,
}: ConnectorMarketplaceProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        <SearchInput
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search connectors"
        />
        <Select
          value={selectedCategory}
          onValueChange={onCategoryChange}
          options={[{ value: 'all', label: 'All categories' }, ...categories.map((category) => ({ value: category, label: category }))]}
          className="w-48"
        />
      </div>
      {connectors.length === 0 && emptyState ? (
        emptyState
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connectors.map((connector) => (
            <ConnectorCard key={connector.id} connector={connector} onInstall={() => onInstall(connector)} onConfigure={() => onConfigure(connector)} />
          ))}
        </div>
      )}
    </div>
  );
}
