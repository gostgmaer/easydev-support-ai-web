import * as React from 'react';
import { useForm } from 'react-hook-form';
import { MailX } from 'lucide-react';
import { Form } from '../form/Form';
import { FormField } from '../form/FormField';
import { Input } from '../base/Input';
import { EmailInput } from '../base/EmailInput';
import { Textarea } from '../base/Textarea';
import { Button } from '../base/Button';

export interface WidgetOfflineFormValues {
  name: string;
  email: string;
  message: string;
}

export interface WidgetOfflineFormProps {
  onSubmit: (values: WidgetOfflineFormValues) => void | Promise<void>;
}

export function WidgetOfflineForm({ onSubmit }: WidgetOfflineFormProps) {
  const form = useForm<WidgetOfflineFormValues>({ defaultValues: { name: '', email: '', message: '' } });
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <MailX className="h-4 w-4 text-muted-foreground" />
        We're offline right now — leave us a message
      </div>
      <Form form={form} onSubmit={onSubmit} className="space-y-3">
        <FormField name="name" label="Name" required rules={{ required: 'Name is required' }} render={({ field, id }) => <Input id={id} {...field} />} />
        <FormField
          name="email"
          label="Email"
          required
          rules={{ required: 'Email is required' }}
          render={({ field, id }) => <EmailInput id={id} {...field} />}
        />
        <FormField
          name="message"
          label="Message"
          required
          rules={{ required: 'Message is required' }}
          render={({ field, id }) => <Textarea id={id} rows={4} {...field} />}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Send message
        </Button>
      </Form>
    </div>
  );
}
