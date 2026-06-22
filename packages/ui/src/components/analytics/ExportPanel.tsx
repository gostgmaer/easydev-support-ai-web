import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Download } from 'lucide-react';
import { Button } from '../base/Button';
import { RadioGroup } from '../base/RadioGroup';
import { Checkbox } from '../base/Checkbox';
import type { ExportFormat } from '../../types/table';

export interface ExportColumnOption {
  id: string;
  label: string;
}

export interface ExportPanelProps {
  formats: ExportFormat[];
  columns: ExportColumnOption[];
  onExport: (format: ExportFormat, selectedColumnIds: string[]) => void | Promise<void>;
  isExporting?: boolean;
}

export function ExportPanel({ formats, columns, onExport, isExporting = false }: ExportPanelProps) {
  const [format, setFormat] = React.useState<ExportFormat>(formats[0] ?? 'csv');
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>(columns.map((c) => c.id));

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <Button variant="outline" size="sm" leadingIcon={<Download className="h-4 w-4" />}>
          Export
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={4}
          className="z-dropdown w-72 space-y-4 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-dropdown"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Format</p>
            <RadioGroup
              value={format}
              onValueChange={setFormat}
              orientation="horizontal"
              options={formats.map((f) => ({ value: f, label: f.toUpperCase() }))}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Columns</p>
            <div className="max-h-40 space-y-1.5 overflow-y-auto">
              {columns.map((column) => (
                <Checkbox
                  key={column.id}
                  checked={selectedColumns.includes(column.id)}
                  onCheckedChange={(checked) =>
                    setSelectedColumns((prev) => (checked === true ? [...prev, column.id] : prev.filter((id) => id !== column.id)))
                  }
                  label={column.label}
                />
              ))}
            </div>
          </div>
          <Button
            type="button"
            className="w-full"
            isLoading={isExporting}
            disabled={selectedColumns.length === 0}
            onClick={() => onExport(format, selectedColumns)}
          >
            Export {format.toUpperCase()}
          </Button>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
