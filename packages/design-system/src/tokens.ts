/**
 * Single source of truth for design tokens, mirrored 1:1 from DESIGN_SYSTEM.md.
 * Consumed both by the Tailwind preset (tailwind-preset.ts) and directly by
 * components that need raw values (charts, canvases, inline styles).
 */
export const colors = {
  primary: {
    50: 'hsl(210, 40%, 96.1%)',
    100: 'hsl(210, 40%, 90%)',
    500: 'hsl(217, 91%, 60%)',
    600: 'hsl(221, 83%, 53%)',
    900: 'hsl(222, 47%, 11%)',
  },
  neutral: {
    50: 'hsl(210, 40%, 98%)',
    100: 'hsl(210, 40%, 96%)',
    200: 'hsl(214, 32%, 91%)',
    500: 'hsl(215, 16%, 47%)',
    900: 'hsl(222, 47%, 11%)',
  },
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(48, 96%, 53%)',
  danger: 'hsl(346, 84%, 61%)',
  info: 'hsl(199, 89%, 48%)',
} as const;

export const radii = {
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
} as const;

export const zIndex = {
  dropdown: 1000,
  modal: 2000,
  tooltip: 3000,
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const spacing = {
  compact: '0.5rem',
  standard: '1rem',
  loose: '1.5rem',
} as const;

export const typography = {
  fontFamily: 'Inter, sans-serif',
  h1: 'text-4xl font-bold tracking-tight leading-none',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-lg font-medium',
  body: 'text-sm leading-relaxed',
  label: 'text-xs font-semibold uppercase tracking-wider',
} as const;

/** Per DESIGN_SYSTEM.md ยง7: standardized focus-visible ring for all focusable targets. */
export const focusRingClassName =
  'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none';

export const typingKeyframes = {
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-4px)' },
} as const;
