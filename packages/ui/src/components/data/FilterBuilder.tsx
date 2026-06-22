import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Select } from '../base/Select';
import { Input } from '../base/Input';
import { NumberInput } from '../base/NumberInput';
import { DatePicker } from '../base/DatePicker';
import { Button } from '../base/Button';
import { IconButton } from '../base/IconButton';
import type { FilterCondition, FilterGroup, FilterOperator } from '../../types/table';
import { cn } from '../../utils';

export interface FilterFieldDef {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: Array<{ value: string; label: string }>;
}

const OPERATORS_BY_TYPE: Record<FilterFieldDef['type'], FilterOperator[]> = {
  text: ['contains', 'not_contains', 'eq', 'is_empty', 'is_not_empty'],
  number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between'],
  date: ['eq', 'gt', 'gte', 'lt', 'lte', 'between'],
  select: ['eq', 'neq', 'in', 'not_in'],
};

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: 'is',
  neq: 'is not',
  contains: 'contains',
  not_contains: 'does not contain',
  gt: 'greater than',
  gte: 'at least',
  lt: 'less than',
  lte: 'at most',
  between: 'between',
  in: 'is any of',
  not_in: 'is none of',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
};

export interface FilterBuilderProps {
  fields: FilterFieldDef[];
  value: FilterGroup;
  onChange: (value: FilterGroup) => void;
  className?: string;
}

export function FilterBuilder({ fields, value, onChange, className }: FilterBuilderProps) {
  const updateCondition = (id: string, patch: Partial<FilterCondition>) => {
    onChange({
      ...value,
      conditions: value.conditions.map((condition) => (condition.id === id ? { ...condition, ...patch } : condition)),
    });
  };

  const addCondition = () => {
    const firstField = fields[0];
    if (!firstField) return;
    const condition: FilterCondition = {
      id: crypto.randomUUID(),
      field: firstField.id,
      operator: OPERATORS_BY_TYPE[firstField.type][0]!,
      value: undefined,
    };
    onChange({ ...value, conditions: [...value.conditions, condition] });
  };

  const removeCondition = (id: string) => {
    onChange({ ...value, conditions: value.conditions.filter((condition) => condition.id !== id) });
  };

  return (
    <div className={cn('space-y-3', className)}>
      {value.conditions.map((condition, index) => {
        const field = fields.find((f) => f.id === condition.field);
        const fieldType = field?.type ?? 'text';
        const operators = OPERATORS_BY_TYPE[fieldType];
        const requiresValue = !['is_empty', 'is_not_empty'].includes(condition.operator);

        return (
          <div key={condition.id} className="flex flex-wrap items-center gap-2">
            {index > 0 && (
              <Select
                value={value.combinator}
                onValueChange={(combinator) => onChange({ ...value, combinator })}
                options={[
                  { value: 'and', label: 'AND' },
                  { value: 'or', label: 'OR' },
                ]}
                className="w-20"
              />
            )}
            <Select
              value={condition.field}
              onValueChange={(fieldId) => {
                const nextField = fields.find((f) => f.id === fieldId);
                updateCondition(condition.id, {
                  field: fieldId,
                  operator: OPERATORS_BY_TYPE[nextField?.type ?? 'text'][0]!,
                  value: undefined,
                });
              }}
              options={fields.map((f) => ({ value: f.id, label: f.label }))}
              className="w-40"
            />
            <Select
              value={condition.operator}
              onValueChange={(operator) => updateCondition(condition.id, { operator: operator as FilterOperator })}
              options={operators.map((operator) => ({ value: operator, label: OPERATOR_LABELS[operator] }))}
              className="w-44"
            />
            {requiresValue && fieldType === 'number' && (
              <NumberInput
                value={(condition.value as number) ?? null}
                onValueChange={(numberValue) => updateCondition(condition.id, { value: numberValue })}
                className="w-32"
              />
            )}
            {requiresValue && fieldType === 'date' && (
              <DatePicker
                value={condition.value as Date | undefined}
                onValueChange={(date) => updateCondition(condition.id, { value: date })}
                className="w-44"
              />
            )}
            {requiresValue && fieldType === 'select' && (
              <Select
                value={condition.value as string}
                onValueChange={(selectValue) => updateCondition(condition.id, { value: selectValue })}
                options={field?.options ?? []}
                className="w-44"
              />
            )}
            {requiresValue && fieldType === 'text' && (
              <Input
                value={(condition.value as string) ?? ''}
                onChange={(event) => updateCondition(condition.id, { value: event.target.value })}
                className="w-44"
              />
            )}
            <IconButton icon={<Trash2 className="h-4 w-4" />} label="Remove condition" variant="ghost" size="sm" onClick={() => removeCondition(condition.id)} />
          </div>
        );
      })}
      <Button type="button" variant="outline" size="sm" leadingIcon={<Plus className="h-4 w-4" />} onClick={addCondition}>
        Add condition
      </Button>
    </div>
  );
}
