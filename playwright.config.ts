import { defineConfig, devices } from '@playwright/test';

// Point the suite at another server with PLAYWRIGHT_BASE_URL (e.g. http://localhost:3105 or a preview URL).
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
