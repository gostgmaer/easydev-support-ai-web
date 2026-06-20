import type { Config } from 'tailwindcss';
import { colors, radii } from './tokens';

/**
 * Shared Tailwind v3 preset. Apps extend this in their own tailwind.config.ts
 * via `presets: [easydevPreset]` so every app renders from one token source.
 */
export const easydevPreset = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: colors.primary,
        neutral: colors.neutral,
        success: colors.success,
        warning: colors.warning,
        danger: colors.danger,
        info: colors.info,
      },
      borderRadius: {
        sm: radii.sm,
        md: radii.md,
        lg: radii.lg,
      },
      zIndex: {
        dropdown: '1000',
        modal: '2000',
        tooltip: '3000',
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
