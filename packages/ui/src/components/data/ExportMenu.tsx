import * as React from 'react';
import { Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../base/Dropdown';
import { Button } from '../base/Button';
import type { ExportOption } from '../../types/table';

export interface ExportMenuProps {
  options: ExportOption[];
  isExporting?: boolean;
}

export function ExportMenu({ options, isExporting = false }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" leadingIcon={<Download className="h-4 w-4" />} isLoading={isExporting}>
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {options.map((option) => (
          <DropdownMenuItem key={option.format} onSelect={() => option.onExport()}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
