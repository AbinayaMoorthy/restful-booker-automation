const { defineConfig } = require('@playwright/test');

const isCI = !!process.env.CI;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,     // 60s per test — the site can be slow
  expect: { timeout: 15000 }, // 15s for each assertion

  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,                 // one browser at a time

  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-reports', open: 'never' }],
  ],

  use: {
    baseURL: 'https://automationintesting.online',
    headless: isCI,                // headed locally, headless on GitHub
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: 15000,           // each click/fill gets 15s
    navigationTimeout: 30000,       // page loads get 30s
  },
});
