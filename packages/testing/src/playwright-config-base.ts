import type { PlaywrightTestConfig } from '@playwright/test';

export function createPlaywrightConfig(options: { baseURL: string; port: number }): PlaywrightTestConfig {
  return {
    testDir: './e2e',
    fullyParallel: true,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
      baseURL: options.baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
    },
    webServer: {
      command: 'pnpm dev',
      url: options.baseURL,
      port: options.port,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  };
}
