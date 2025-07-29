import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'tests/reports' }],
    ['json', { outputFile: 'tests/reports/playwright-results.json' }]
  ],
  use: {
    actionTimeout: 0,
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    coverageName: 'v8',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'npm run backend',
      port: 3000,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      waitOnScheme: {
        resources: ['tcp:3000'],
        delay: 1000,
        interval: 250,
        timeout: 120000
      }
    },
    {
      command: 'npx vite --port=5000',
      port: 5000,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      waitOnScheme: {
        resources: ['tcp:5000'],
        delay: 1000,
        interval: 250,
        timeout: 120000
      }
    }
  ],
});
