import * as React from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { Form } from './Form';
import { FormField } from './FormField';
import { FormActions } from './FormActions';
import { Input } from '../base/Input';
import { EmailInput } from '../base/EmailInput';
import { PasswordInput } from '../base/PasswordInput';
import { Textarea } from '../base/Textarea';
import { NumberInput } from '../base/NumberInput';
import { Select } from '../base/Select';
import { MultiSelect } from '../base/MultiSelect';
import { Checkbox } from '../base/Checkbox';
import { Switch } from '../base/Switch';
import { RadioGroup } from '../base/RadioGroup';
import { DatePicker } from '../base/DatePicker';
import type { OptionItem } from '../../types/common';

export type DynamicFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'date';

export interface DynamicFieldSchema {
  name: string;
  type: DynamicFieldType;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: OptionItem[];
  defaultValue?: unknown;
}

export interface DynamicFormRendererProps {
  fields: DynamicFieldSchema[];
  onSubmit: (values: FieldValues) => void | Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

export function DynamicFormRenderer({ fields, onSubmit, submitLabel = 'Save', onCancel }: DynamicFormRendererProps) {
  const defaultValues = React.useMemo(
    () => Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? defaultForType(field.type)])),
    [fields],
  );
  const form = useForm({ defaultValues });
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form form={form} onSubmit={onSubmit}>
      {fields.map((schema) => (
        <FormField
          key={schema.name}
          name={schema.name}
          label={schema.label}
          description={schema.description}
          required={schema.required}
          rules={schema.required ? { required: 'This field is required' } : undefined}
          render={({ field, id }) => renderControl(schema, field, id)}
        />
      ))}
      <FormActions submitLabel={submitLabel} onCancel={onCancel} isSubmitting={isSubmitting} />
    </Form>
  );
}

function defaultForType(type: DynamicFieldType): unknown {
  switch (type) {
    case 'checkbox':
    case 'switch':
      return false;
    case 'multiselect':
      return [];
    case 'number':
      return null;
    default:
      return '';
  }
}

function renderControl(
  schema: DynamicFieldSchema,
  field: { value: unknown; onChange: (value: unknown) => void; onBlur: () => void; name: string },
  id: string,
): React.ReactElement {
  switch (schema.type) {
    case 'email':
      return (
        <EmailInput id={id} placeholder={schema.placeholder} value={field.value as string} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} />
      );
    case 'password':
      return (
        <PasswordInput id={id} placeholder={schema.placeholder} value={field.value as string} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} />
      );
    case 'number':
      return <NumberInput id={id} value={field.value as number | null} onValueChange={field.onChange} />;
    case 'textarea':
      return (
        <Textarea id={id} placeholder={schema.placeholder} value={field.value as string} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} />
      );
    case 'select':
      return <Select value={field.value as string} onValueChange={field.onChange} options={schema.options ?? []} placeholder={schema.placeholder} />;
    case 'multiselect':
      return <MultiSelect values={(field.value as string[]) ?? []} onValuesChange={field.onChange} options={schema.options ?? []} placeholder={schema.placeholder} />;
    case 'checkbox':
      return <Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} />;
    case 'switch':
      return <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />;
    case 'radio':
      return <RadioGroup value={field.value as string} onValueChange={field.onChange} options={schema.options ?? []} />;
    case 'date':
      return <DatePicker value={field.value as Date | undefined} onValueChange={field.onChange} />;
    case 'text':
    default:
      return (
        <Input id={id} placeholder={schema.placeholder} value={field.value as string} onChange={(e) => field.onChange(e.target.value)} onBlur={field.onBlur} />
      );
  }
}
