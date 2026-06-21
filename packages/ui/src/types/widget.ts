export type WidgetPosition = 'bottom-right' | 'bottom-left';

export type WidgetFieldType = 'text' | 'email' | 'phone' | 'select' | 'textarea';

export interface WidgetPreChatFieldDef {
  id: string;
  type: WidgetFieldType;
  label: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface WidgetFeedbackPayload {
  rating: number;
  comment?: string;
}

export type WidgetAuthMode = 'guest' | 'verified';
