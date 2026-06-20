import type { Config } from 'tailwindcss';
import { colorFamilies, COLOR_STEPS, type ColorFamily } from './tokens/colors';
import { spacing } from './tokens/spacing';
import { radius } from './tokens/radius';
import { shadows } from './tokens/shadows';
import { zIndex } from './tokens/z-index';
import { opacity } from './tokens/opacity';
import { breakpoints } from './tokens/breakpoints';
import { containerSizes } from './tokens/layout';
import { fontFamily, typography } from './tokens/typography';
import { duration, easing } from './tokens/motion';

function cssVar(name: string): string {
  return `hsl(var(--${name}))`;
}

/** Builds a Tailwind color entry combining the literal 50-900 ramp with CSS-variable-driven semantic aliases. */
function colorScale(
  family: ColorFamily,
  options: { foreground?: boolean; withDefault?: boolean } = {},
): Record<string, string> {
  const { foreground = false, withDefault = true } = options;
  const scale: Record<string, string> = {};
  if (withDefault) scale.DEFAULT = cssVar(family);
  for (const step of COLOR_STEPS) {
    scale[step] = cssVar(`${family}-${step}`);
  }
  if (foreground) {
    scale.foreground = cssVar(`${family}-foreground`);
  }
  return scale;
}

function fontSizeEntry(key: keyof typeof typography): [string, { lineHeight: string; fontWeight: number; letterSpacing?: string }] {
  const token = typography[key];
  return [token.fontSize, { lineHeight: token.lineHeight, fontWeight: token.fontWeight, letterSpacing: token.letterSpacing }];
}

export const easydevPreset = {
  darkMode: 'class',
  theme: {
    screens: breakpoints,
    container: {
      center: true,
      padding: spacing[4],
      screens: {
        mobile: containerSizes.sm,
        tablet: containerSizes.md,
        desktop: containerSizes.lg,
        wide: containerSizes.xl,
        ultrawide: containerSizes['2xl'],
      },
    },
    extend: {
      fontFamily: {
        sans: [...fontFamily.sans],
        mono: [...fontFamily.mono],
      },
      colors: {
        primary: colorScale('primary', { foreground: true }),
        secondary: colorScale('secondary', { foreground: true }),
        neutral: colorScale('neutral', { withDefault: false }),
        accent: colorScale('accent', { foreground: true }),
        success: colorScale('success', { foreground: true }),
        warning: colorScale('warning', { foreground: true }),
        danger: colorScale('danger', { foreground: true }),
        info: colorScale('info', { foreground: true }),
        background: cssVar('background'),
        foreground: cssVar('foreground'),
        card: { DEFAULT: cssVar('card'), foreground: cssVar('card-foreground') },
        popover: { DEFAULT: cssVar('popover'), foreground: cssVar('popover-foreground') },
        muted: { DEFAULT: cssVar('muted'), foreground: cssVar('muted-foreground') },
        border: cssVar('border'),
        input: cssVar('input'),
        ring: cssVar('ring'),
      },
      spacing,
      borderRadius: radius,
      boxShadow: shadows,
      zIndex: Object.fromEntries(Object.entries(zIndex).map(([key, value]) => [key, String(value)])),
      opacity,
      fontSize: {
        display: fontSizeEntry('display'),
        h1: fontSizeEntry('h1'),
        h2: fontSizeEntry('h2'),
        h3: fontSizeEntry('h3'),
        h4: fontSizeEntry('h4'),
        h5: fontSizeEntry('h5'),
        h6: fontSizeEntry('h6'),
        'body-lg': fontSizeEntry('bodyLarge'),
        'body-md': fontSizeEntry('bodyMedium'),
        'body-sm': fontSizeEntry('bodySmall'),
        caption: fontSizeEntry('caption'),
        label: fontSizeEntry('label'),
        code: fontSizeEntry('code'),
        'table-text': fontSizeEntry('tableText'),
      },
      transitionDuration: {
        fast: `${duration.fast * 1000}ms`,
        normal: `${duration.normal * 1000}ms`,
        slow: `${duration.slow * 1000}ms`,
      },
      transitionTimingFunction: {
        standard: `cubic-bezier(${easing.standard.join(',')})`,
        decelerate: `cubic-bezier(${easing.decelerate.join(',')})`,
        accelerate: `cubic-bezier(${easing.accelerate.join(',')})`,
      },
      animation: {
        'typing-dot': 'typing 1.4s infinite ease-in-out',
      },
      keyframes: {
        typing: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>;

export default easydevPreset;

// Re-exported so consumers authoring a custom preset can reuse the raw families.
export { colorFamilies };
