export interface TypographyToken {
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing?: string;
  className: string;
}

export const fontFamily = {
  sans: ['Inter', 'sans-serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
} as const;

export const typography: Record<
  'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'bodyLarge' | 'bodyMedium' | 'bodySmall' | 'caption' | 'label' | 'code' | 'tableText',
  TypographyToken
> = {
  display: {
    fontSize: '3rem',
    lineHeight: '1',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    className: 'text-5xl font-extrabold tracking-tight leading-none',
  },
  h1: {
    fontSize: '2.25rem',
    lineHeight: '1.15',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    className: 'text-4xl font-bold tracking-tight leading-tight',
  },
  h2: {
    fontSize: '1.875rem',
    lineHeight: '1.2',
    fontWeight: 700,
    letterSpacing: '-0.015em',
    className: 'text-3xl font-bold tracking-tight',
  },
  h3: {
    fontSize: '1.5rem',
    lineHeight: '1.25',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    className: 'text-2xl font-semibold tracking-tight',
  },
  h4: {
    fontSize: '1.25rem',
    lineHeight: '1.3',
    fontWeight: 600,
    className: 'text-xl font-semibold',
  },
  h5: {
    fontSize: '1.125rem',
    lineHeight: '1.4',
    fontWeight: 600,
    className: 'text-lg font-semibold',
  },
  h6: {
    fontSize: '1rem',
    lineHeight: '1.4',
    fontWeight: 600,
    letterSpacing: '0.01em',
    className: 'text-base font-semibold',
  },
  bodyLarge: {
    fontSize: '1rem',
    lineHeight: '1.6',
    fontWeight: 400,
    className: 'text-base leading-relaxed',
  },
  bodyMedium: {
    fontSize: '0.875rem',
    lineHeight: '1.6',
    fontWeight: 400,
    className: 'text-sm leading-relaxed',
  },
  bodySmall: {
    fontSize: '0.75rem',
    lineHeight: '1.5',
    fontWeight: 400,
    className: 'text-xs leading-relaxed',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: '1.4',
    fontWeight: 500,
    className: 'text-xs font-medium text-muted-foreground',
  },
  label: {
    fontSize: '0.75rem',
    lineHeight: '1.3',
    fontWeight: 600,
    letterSpacing: '0.06em',
    className: 'text-xs font-semibold uppercase tracking-wider',
  },
  code: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    fontWeight: 400,
    className: 'font-mono text-sm',
  },
  tableText: {
    fontSize: '0.8125rem',
    lineHeight: '1.35',
    fontWeight: 400,
    className: 'text-[13px] leading-snug',
  },
};

export type TypographyKey = keyof typeof typography;
