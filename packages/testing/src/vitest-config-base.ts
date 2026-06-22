import type { UserConfig } from 'vite';

/**
 * Shared Vitest defaults. Apps/packages spread this into their own
 * `defineConfig({ ...baseVitestConfig, ... })` and add their own plugins/aliases.
 */
export const baseVitestConfig: UserConfig['test'] = {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['@easydev/testing/vitest-setup'],
  css: false,
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    thresholds: {
      lines: 80,
      statements: 80,
      branches: 70,
      functions: 80,
    },
  },
};
