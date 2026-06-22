import * as React from 'react';
import { DynamicFormRenderer, type DynamicFieldSchema, type DynamicFieldType } from './DynamicFormRenderer';
import type { FieldValues } from 'react-hook-form';

export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array';
  title?: string;
  description?: string;
  format?: 'email' | 'password' | 'textarea' | 'date';
  enum?: string[];
  default?: unknown;
  items?: { enum?: string[] };
}

export interface JSONSchemaObject {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface JSONSchemaFormProps {
  schema: JSONSchemaObject;
  onSubmit: (values: FieldValues) => void | Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

function propertyToFieldType(property: JSONSchemaProperty): DynamicFieldType {
  if (property.enum) return 'select';
  if (property.type === 'array' && property.items?.enum) return 'multiselect';
  if (property.type === 'boolean') return 'checkbox';
  if (property.type === 'number' || property.type === 'integer') return 'number';
  if (property.format === 'email') return 'email';
  if (property.format === 'password') return 'password';
  if (property.format === 'textarea') return 'textarea';
  if (property.format === 'date') return 'date';
  return 'text';
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());
}

export function jsonSchemaToFields(schema: JSONSchemaObject): DynamicFieldSchema[] {
  const required = new Set(schema.required ?? []);
  return Object.entries(schema.properties).map(([name, property]) => {
    const enumValues = property.enum ?? property.items?.enum;
    return {
      name,
      type: propertyToFieldType(property),
      label: property.title ?? humanizeKey(name),
      description: property.description,
      required: required.has(name),
      defaultValue: property.default,
      options: enumValues?.map((value) => ({ value, label: value })),
    };
  });
}

export function JSONSchemaForm({ schema, onSubmit, submitLabel, onCancel }: JSONSchemaFormProps) {
  const fields = React.useMemo(() => jsonSchemaToFields(schema), [schema]);
  return <DynamicFormRenderer fields={fields} onSubmit={onSubmit} submitLabel={submitLabel} onCancel={onCancel} />;
}
