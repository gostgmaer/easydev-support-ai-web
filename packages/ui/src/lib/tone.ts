import type { ComponentTone } from '../types/common';

interface ToneClassNames {
  bg: string;
  text: string;
  border: string;
}

const TONE_CLASS_MAP: Record<ComponentTone, ToneClassNames> = {
  neutral: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200' },
  primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  secondary: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20' },
  success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  danger: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
  info: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20' },
};

export function toneClassNames(tone: ComponentTone): ToneClassNames {
  return TONE_CLASS_MAP[tone];
}

export function confidenceTone(score: number): ComponentTone {
  if (score >= 0.85) return 'success';
  if (score >= 0.6) return 'warning';
  return 'danger';
}
