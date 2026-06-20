export * from './tokens/colors';
export * from './tokens/spacing';
export * from './tokens/radius';
export * from './tokens/typography';
export * from './tokens/shadows';
export * from './tokens/z-index';
export * from './tokens/opacity';
export * from './tokens/breakpoints';
export * from './tokens/layout';
export * from './tokens/motion';

/** Per DESIGN_SYSTEM.md ยง7: standardized focus-visible ring for all focusable targets. */
export const focusRingClassName = 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

export const typingKeyframes = {
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-4px)' },
} as const;
