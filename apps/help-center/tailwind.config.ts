import type { Config } from 'tailwindcss';
import { easydevPreset } from '@easydev/design-system/tailwind-preset';

const config: Config = {
  presets: [easydevPreset as Partial<Config>],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/design-system/src/**/*.{js,ts,jsx,tsx}',
  ],
};

export default config;
