const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,           // 60s per test — the site can be slow
  expect: { timeout: 15000 }, // 15s for each assertion

  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-reports', open: 'never' }],
  ],

  use: {
    baseURL: 'https://automationintesting.online',
    headless: false,                // watch it run; flip to true for CI
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,           // each click/fill gets 15s
    navigationTimeout: 30000,       // page loads get 30s
  },
});
