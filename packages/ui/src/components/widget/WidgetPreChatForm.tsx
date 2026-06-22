import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '../form/Form';
import { FormField } from '../form/FormField';
import { Input } from '../base/Input';
import { EmailInput } from '../base/EmailInput';
import { PhoneInput } from '../base/PhoneInput';
import { Select } from '../base/Select';
import { Textarea } from '../base/Textarea';
import { Button } from '../base/Button';
import type { WidgetPreChatFieldDef } from '../../types/widget';

export interface WidgetPreChatFormProps {
  fields: WidgetPreChatFieldDef[];
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
  submitLabel?: string;
}

export function WidgetPreChatForm({ fields, onSubmit, submitLabel = 'Start chat' }: WidgetPreChatFormProps) {
  const form = useForm({ defaultValues: Object.fromEntries(fields.map((field) => [field.id, ''])) });
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-4 p-4">
      {fields.map((fieldDef) => (
        <FormField
          key={fieldDef.id}
          name={fieldDef.id}
          label={fieldDef.label}
          required={fieldDef.required}
          rules={fieldDef.required ? { required: 'This field is required' } : undefined}
          render={({ field, id }) => {
            if (fieldDef.type === 'email') return <EmailInput id={id} {...field} />;
            if (fieldDef.type === 'phone') {
              return <PhoneInput id={id} dialCode="+1" onDialCodeChange={() => {}} {...field} />;
            }
            if (fieldDef.type === 'select') {
              return <Select value={field.value} onValueChange={field.onChange} options={fieldDef.options ?? []} />;
            }
            if (fieldDef.type === 'textarea') return <Textarea id={id} {...field} />;
            return <Input id={id} {...field} />;
          }}
        />
      ))}
      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
    </Form>
  );
}
